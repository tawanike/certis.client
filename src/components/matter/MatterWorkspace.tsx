'use client';

import React, { useState, useEffect, useCallback } from 'react';
import ChatSidebar from './ChatSidebar';
import { mattersService } from '@/services/matters.service';
import ArtifactPreview from './ArtifactPreview';
import {
    ChatMessage,
    type Claim,
    type Workstream,
    type WorkstreamType,
    mockWorkstreams,
} from '@/data/mockData';
import { Stage } from '@/components/ProgressTracker';
import { Matter, BriefVersion, ClaimGraphVersion, Suggestion, QAReportVersion, RiskAnalysisVersion, SpecVersion } from '@/types';

type ArtifactTab = 'brief' | 'claims' | 'risk' | 'spec' | 'qa' | 'wrapper';

// Convert backend ClaimNode format to the Claim tree format used by ClaimTree component
function convertClaimGraphToClaims(graphData: any): Claim[] {
    if (!graphData?.nodes) return [];
    const nodes = graphData.nodes;
    const nodeMap = new Map<string, any>();
    nodes.forEach((n: any) => nodeMap.set(n.id, n));

    // Find root nodes (independent or no dependencies)
    const rootIds = new Set<string>();
    const childIds = new Set<string>();
    nodes.forEach((n: any) => {
        if (n.type === 'independent' || !n.dependencies || n.dependencies.length === 0) {
            rootIds.add(n.id);
        } else {
            childIds.add(n.id);
        }
    });

    function buildClaim(node: any): Claim {
        const children = nodes
            .filter((n: any) => n.dependencies?.includes(node.id))
            .map((n: any) => buildClaim(n));
        return {
            id: parseInt(node.id) || 0,
            type: node.type || 'independent',
            category: node.category || 'system',
            text: node.text,
            dependsOn: node.dependencies?.[0] ? parseInt(node.dependencies[0]) : undefined,
            riskFlags: [],
            children,
        };
    }

    return nodes
        .filter((n: any) => rootIds.has(n.id))
        .map((n: any) => buildClaim(n));
}

interface MatterWorkspaceProps {
    matterId: string;
}

export default function MatterWorkspace({ matterId }: MatterWorkspaceProps) {
    const [workstreams, setWorkstreams] = useState<Workstream[]>(mockWorkstreams);
    const [activeWorkstreamId, setActiveWorkstreamId] = useState(mockWorkstreams[0].id);
    const [claims, setClaims] = useState<Claim[]>([]);
    const [activeTab, setActiveTab] = useState<ArtifactTab>('brief');
    const [chatInputPrefill, setChatInputPrefill] = useState('');

    const activeWorkstream = workstreams.find(ws => ws.id === activeWorkstreamId)!;
    const currentStage = (activeWorkstream?.stage || 'brief') as Stage;

    const [documents, setDocuments] = useState<any[]>([]);
    const [matter, setMatter] = useState<Matter | null>(null);
    const [briefVersion, setBriefVersion] = useState<BriefVersion | null>(null);
    const [claimVersion, setClaimVersion] = useState<ClaimGraphVersion | null>(null);
    const [isApprovingBrief, setIsApprovingBrief] = useState(false);
    const [isGeneratingClaims, setIsGeneratingClaims] = useState(false);
    const [isCommittingClaims, setIsCommittingClaims] = useState(false);
    const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
    const [suggestionsLoading, setSuggestionsLoading] = useState(false);
    const [highlightedClaimId, setHighlightedClaimId] = useState<number | null>(null);
    const [riskVersion, setRiskVersion] = useState<RiskAnalysisVersion | null>(null);
    const [isGeneratingRisk, setIsGeneratingRisk] = useState(false);
    const [isCommittingRisk, setIsCommittingRisk] = useState(false);
    const [specVersion, setSpecVersion] = useState<SpecVersion | null>(null);
    const [isGeneratingSpec, setIsGeneratingSpec] = useState(false);
    const [isCommittingSpec, setIsCommittingSpec] = useState(false);
    const [qaVersion, setQAVersion] = useState<QAReportVersion | null>(null);
    const [isRunningQA, setIsRunningQA] = useState(false);
    const [isCommittingQA, setIsCommittingQA] = useState(false);
    const [isLocking, setIsLocking] = useState(false);
    const [isExporting, setIsExporting] = useState(false);

    const DEMO_MATTER_ID = matterId;

    // Fetch matter data
    const refreshMatter = useCallback(async () => {
        try {
            const m = await mattersService.get(DEMO_MATTER_ID);
            setMatter(m);
        } catch (err) {
            console.error("Failed to fetch matter", err);
        }
    }, [DEMO_MATTER_ID]);

    // Fetch latest brief version
    const refreshBrief = useCallback(async () => {
        try {
            const versions = await mattersService.listBriefVersions(DEMO_MATTER_ID);
            if (versions.length > 0) {
                // Get the latest version (highest version_number)
                const latest = versions.reduce((a, b) => a.version_number > b.version_number ? a : b);
                setBriefVersion(latest);
            }
        } catch (err) {
            console.error("Failed to fetch brief versions", err);
        }
    }, [DEMO_MATTER_ID]);

    // Fetch latest claim version
    const refreshClaims = useCallback(async () => {
        try {
            const versions = await mattersService.listClaimVersions(DEMO_MATTER_ID);
            if (versions.length > 0) {
                const latest = versions.reduce((a, b) => a.version_number > b.version_number ? a : b);
                setClaimVersion(latest);
                setClaims(convertClaimGraphToClaims(latest.graph_data));
            }
        } catch (err) {
            console.error("Failed to fetch claim versions", err);
        }
    }, [DEMO_MATTER_ID]);

    // Fetch latest risk version
    const refreshRisk = useCallback(async () => {
        try {
            const versions = await mattersService.listRiskVersions(DEMO_MATTER_ID);
            if (versions.length > 0) {
                const latest = versions.reduce((a, b) => a.version_number > b.version_number ? a : b);
                setRiskVersion(latest);
            }
        } catch (err) {
            console.error("Failed to fetch risk versions", err);
        }
    }, [DEMO_MATTER_ID]);

    // Fetch latest spec version
    const refreshSpec = useCallback(async () => {
        try {
            const versions = await mattersService.listSpecVersions(DEMO_MATTER_ID);
            if (versions.length > 0) {
                const latest = versions.reduce((a, b) => a.version_number > b.version_number ? a : b);
                setSpecVersion(latest);
            }
        } catch (err) {
            console.error("Failed to fetch spec versions", err);
        }
    }, [DEMO_MATTER_ID]);

    // Suggestions
    const refreshSuggestions = useCallback(async () => {
        setSuggestionsLoading(true);
        try {
            const resp = await mattersService.getSuggestions(DEMO_MATTER_ID);
            setSuggestions(resp.suggestions);
        } catch (err) {
            console.error("Failed to fetch suggestions", err);
        } finally {
            setSuggestionsLoading(false);
        }
    }, [DEMO_MATTER_ID]);

    // Fetch latest QA version
    const refreshQA = useCallback(async () => {
        try {
            const versions = await mattersService.listQAVersions(DEMO_MATTER_ID);
            if (versions.length > 0) {
                const latest = versions.reduce((a, b) => a.version_number > b.version_number ? a : b);
                setQAVersion(latest);
            }
        } catch (err) {
            console.error("Failed to fetch QA versions", err);
        }
    }, [DEMO_MATTER_ID]);

    useEffect(() => {
        refreshMatter();
        refreshBrief();
        refreshClaims();
        refreshRisk();
        refreshSpec();
        refreshSuggestions();
        refreshQA();
    }, [refreshMatter, refreshBrief, refreshClaims, refreshRisk, refreshSpec, refreshSuggestions, refreshQA]);

    useEffect(() => {
        async function fetchDocs() {
            try {
                const docs = await mattersService.listDocuments(DEMO_MATTER_ID);
                setDocuments(docs);
            } catch (err) {
                console.error("Failed to fetch documents", err);
            }
        }
        fetchDocs();
    }, [DEMO_MATTER_ID]);

    // Brief upload success handler
    const handleBriefUploadSuccess = useCallback(async (data: any) => {
        await refreshBrief();
        await refreshMatter();
        setActiveTab('brief');
        refreshSuggestions();
    }, [refreshBrief, refreshMatter, refreshSuggestions]);

    // Brief approval handler
    const handleApproveBrief = useCallback(async () => {
        if (!briefVersion) return;
        setIsApprovingBrief(true);
        try {
            await mattersService.approveBrief(DEMO_MATTER_ID, briefVersion.id);
            await refreshBrief();
            await refreshMatter();
            refreshSuggestions();
        } catch (err) {
            console.error("Failed to approve brief", err);
        } finally {
            setIsApprovingBrief(false);
        }
    }, [DEMO_MATTER_ID, briefVersion, refreshBrief, refreshMatter, refreshSuggestions]);

    // Claims generation handler
    const handleGenerateClaims = useCallback(async () => {
        setIsGeneratingClaims(true);
        try {
            const briefId = briefVersion?.is_authoritative ? briefVersion.id : undefined;
            await mattersService.generateClaims(DEMO_MATTER_ID, briefId);
            await refreshClaims();
            await refreshMatter();
            setActiveTab('claims');
            refreshSuggestions();
        } catch (err) {
            console.error("Failed to generate claims", err);
        } finally {
            setIsGeneratingClaims(false);
        }
    }, [DEMO_MATTER_ID, briefVersion, refreshClaims, refreshMatter, refreshSuggestions]);

    // Claims commit handler
    const handleCommitClaims = useCallback(async () => {
        if (!claimVersion) return;
        setIsCommittingClaims(true);
        try {
            await mattersService.commitClaims(DEMO_MATTER_ID, claimVersion.id);
            await refreshClaims();
            await refreshMatter();
            refreshSuggestions();
        } catch (err) {
            console.error("Failed to commit claims", err);
        } finally {
            setIsCommittingClaims(false);
        }
    }, [DEMO_MATTER_ID, claimVersion, refreshClaims, refreshMatter, refreshSuggestions]);

    // Risk generation handler
    const handleGenerateRisk = useCallback(async () => {
        setIsGeneratingRisk(true);
        try {
            await mattersService.generateRiskAnalysis(DEMO_MATTER_ID);
            await refreshRisk();
            await refreshMatter();
            setActiveTab('risk');
            refreshSuggestions();
        } catch (err) {
            console.error("Failed to generate risk analysis", err);
        } finally {
            setIsGeneratingRisk(false);
        }
    }, [DEMO_MATTER_ID, refreshRisk, refreshMatter, refreshSuggestions]);

    // Risk commit handler
    const handleCommitRisk = useCallback(async () => {
        if (!riskVersion) return;
        setIsCommittingRisk(true);
        try {
            await mattersService.commitRisk(DEMO_MATTER_ID, riskVersion.id);
            await refreshRisk();
            await refreshMatter();
            refreshSuggestions();
        } catch (err) {
            console.error("Failed to commit risk analysis", err);
        } finally {
            setIsCommittingRisk(false);
        }
    }, [DEMO_MATTER_ID, riskVersion, refreshRisk, refreshMatter, refreshSuggestions]);

    // Spec generation handler
    const handleGenerateSpec = useCallback(async () => {
        setIsGeneratingSpec(true);
        try {
            await mattersService.generateSpecification(DEMO_MATTER_ID);
            await refreshSpec();
            await refreshMatter();
            setActiveTab('spec');
            refreshSuggestions();
        } catch (err) {
            console.error("Failed to generate specification", err);
        } finally {
            setIsGeneratingSpec(false);
        }
    }, [DEMO_MATTER_ID, refreshSpec, refreshMatter, refreshSuggestions]);

    // Spec commit handler
    const handleCommitSpec = useCallback(async () => {
        if (!specVersion) return;
        setIsCommittingSpec(true);
        try {
            await mattersService.commitSpec(DEMO_MATTER_ID, specVersion.id);
            await refreshSpec();
            await refreshMatter();
            refreshSuggestions();
        } catch (err) {
            console.error("Failed to commit specification", err);
        } finally {
            setIsCommittingSpec(false);
        }
    }, [DEMO_MATTER_ID, specVersion, refreshSpec, refreshMatter, refreshSuggestions]);

    // QA generation handler
    const handleRunQA = useCallback(async () => {
        setIsRunningQA(true);
        try {
            await mattersService.runQAValidation(DEMO_MATTER_ID);
            await refreshQA();
            await refreshMatter();
            setActiveTab('qa');
            refreshSuggestions();
        } catch (err) {
            console.error("Failed to run QA validation", err);
        } finally {
            setIsRunningQA(false);
        }
    }, [DEMO_MATTER_ID, refreshQA, refreshMatter, refreshSuggestions]);

    // QA commit handler
    const handleCommitQA = useCallback(async () => {
        if (!qaVersion) return;
        setIsCommittingQA(true);
        try {
            await mattersService.commitQA(DEMO_MATTER_ID, qaVersion.id);
            await refreshQA();
            await refreshMatter();
            refreshSuggestions();
        } catch (err) {
            console.error("Failed to commit QA", err);
        } finally {
            setIsCommittingQA(false);
        }
    }, [DEMO_MATTER_ID, qaVersion, refreshQA, refreshMatter, refreshSuggestions]);

    // Lock for export handler
    const handleLockForExport = useCallback(async () => {
        setIsLocking(true);
        try {
            await mattersService.lockMatter(DEMO_MATTER_ID);
            await refreshMatter();
            refreshSuggestions();
        } catch (err) {
            console.error("Failed to lock matter for export", err);
        } finally {
            setIsLocking(false);
        }
    }, [DEMO_MATTER_ID, refreshMatter, refreshSuggestions]);

    // Export DOCX handler
    const handleExportDocx = useCallback(async () => {
        setIsExporting(true);
        try {
            const blob = await mattersService.exportDocx(DEMO_MATTER_ID);
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `patent_${DEMO_MATTER_ID}.docx`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (err) {
            console.error("Failed to export DOCX", err);
        } finally {
            setIsExporting(false);
        }
    }, [DEMO_MATTER_ID]);

    const briefApproved = briefVersion?.is_authoritative === true;
    const CLAIMS_APPROVED_STATUSES: string[] = ['CLAIMS_APPROVED', 'RISK_REVIEWED', 'SPEC_GENERATED', 'RISK_RE_REVIEWED', 'QA_COMPLETE', 'LOCKED_FOR_EXPORT'];
    const claimsApproved = matter?.status ? CLAIMS_APPROVED_STATUSES.includes(matter.status) : false;
    const RISK_APPROVED_STATUSES: string[] = ['RISK_REVIEWED', 'SPEC_GENERATED', 'RISK_RE_REVIEWED', 'QA_COMPLETE', 'LOCKED_FOR_EXPORT'];
    const riskApproved = matter?.status ? RISK_APPROVED_STATUSES.includes(matter.status) : false;
    const SPEC_APPROVED_STATUSES: string[] = ['SPEC_GENERATED', 'RISK_RE_REVIEWED', 'QA_COMPLETE', 'LOCKED_FOR_EXPORT'];
    const specApproved = matter?.status ? SPEC_APPROVED_STATUSES.includes(matter.status) : false;

    // Action map: maps action_id strings to handler functions
    const ACTION_MAP: Record<string, () => Promise<void>> = {
        approve_brief: handleApproveBrief,
        generate_claims: handleGenerateClaims,
        commit_claims: handleCommitClaims,
        generate_risk: handleGenerateRisk,
        commit_risk: handleCommitRisk,
        generate_spec: handleGenerateSpec,
        commit_spec: handleCommitSpec,
        run_qa: handleRunQA,
        commit_qa: handleCommitQA,
        lock_for_export: handleLockForExport,
    };

    const handleWorkflowAction = useCallback(async (actionId: string) => {
        const handler = ACTION_MAP[actionId];
        if (handler) {
            await handler();
        } else {
            console.warn(`Unknown workflow action: ${actionId}`);
        }
    }, [handleApproveBrief, handleGenerateClaims, handleCommitClaims, handleGenerateRisk, handleCommitRisk, handleGenerateSpec, handleCommitSpec, handleRunQA, handleCommitQA, handleLockForExport]);

    const handleClaimNavigate = useCallback((claimId: number) => {
        setActiveTab('claims');
        setHighlightedClaimId(claimId);
        setTimeout(() => setHighlightedClaimId(null), 3000);
    }, []);

    const handleSendMessage = async (content: string) => {
        const userMsg: ChatMessage = {
            id: `msg-${Date.now()}`,
            role: 'user',
            content,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        const aiMsgId = `msg-ai-${Date.now()}`;
        const aiMsg: ChatMessage = {
            id: aiMsgId,
            role: 'assistant',
            content: '',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        // Add message to active workstream
        setWorkstreams(prev => prev.map(w => {
            if (w.id === activeWorkstreamId) {
                return { ...w, messages: [...w.messages, userMsg, aiMsg] };
            }
            return w;
        }));

        try {
            const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/v1";
            const { useAuthStore } = await import('@/stores/authStore');
            const token = useAuthStore.getState().token;
            const response = await fetch(`${apiBase}/matters/${DEMO_MATTER_ID}/stream`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({ message: content }),
            });

            if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
            if (!response.body) throw new Error("No response body");

            const reader = response.body.getReader();
            const decoder = new TextDecoder("utf-8");
            let done = false;
            let streamedContent = "";
            let refs: any[] | undefined;

            while (!done) {
                const { value, done: readerDone } = await reader.read();
                done = readerDone;
                if (value) {
                    const chunk = decoder.decode(value, { stream: true });
                    const lines = chunk.split('\n');
                    let currentEvent = 'message';

                    for (const line of lines) {
                        if (line.startsWith('event:')) {
                            currentEvent = line.replace('event:', '').trim();
                        } else if (line.startsWith('data:')) {
                            const dataStr = line.replace('data:', '').trim();
                            if (dataStr) {
                                try {
                                    const payload = JSON.parse(dataStr);
                                    if (currentEvent === 'references') {
                                        refs = payload;
                                        setWorkstreams(prev => prev.map(w => w.id === activeWorkstreamId ? {
                                            ...w, messages: w.messages.map(m => m.id === aiMsgId ? { ...m, references: refs } : m)
                                        } : w));
                                    } else if (currentEvent === 'message') {
                                        streamedContent += payload.content;
                                        let parsedThinking = undefined;
                                        let parsedContent = streamedContent;

                                        const thinkStartIdx = streamedContent.indexOf('<think>');
                                        if (thinkStartIdx !== -1) {
                                            const thinkEndIdx = streamedContent.indexOf('</think>');
                                            if (thinkEndIdx !== -1) {
                                                // We have a full think block
                                                parsedThinking = streamedContent.substring(thinkStartIdx + 7, thinkEndIdx).trimStart();
                                                parsedContent = (streamedContent.substring(0, thinkStartIdx) + streamedContent.substring(thinkEndIdx + 8)).trimStart();
                                            } else {
                                                // Still thinking...
                                                parsedThinking = streamedContent.substring(thinkStartIdx + 7).trimStart();
                                                parsedContent = streamedContent.substring(0, thinkStartIdx).trimStart();
                                            }
                                        }

                                        setWorkstreams(prev => prev.map(w => w.id === activeWorkstreamId ? {
                                            ...w, messages: w.messages.map(m => m.id === aiMsgId ? {
                                                ...m,
                                                content: parsedContent,
                                                thinking: parsedThinking
                                            } : m)
                                        } : w));
                                    } else if (currentEvent === 'done') {
                                        done = true;
                                    }
                                } catch (e) {
                                    console.error("Failed to parse SSE data string", dataStr);
                                }
                            }
                        }
                    }
                }
            }
        } catch (err) {
            console.error("Stream failed", err);
            const errorMsg: ChatMessage = {
                id: `msg-err-${Date.now()}`,
                role: 'assistant',
                content: "⚠️ Connection to Backend Failed. Is the server running?",
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            };
            setWorkstreams(prev => prev.map(w => {
                if (w.id === activeWorkstreamId) {
                    return { ...w, messages: [...w.messages, errorMsg] };
                }
                return w;
            }));
        }
    };

    const handleProposalAction = (messageId: string, action: 'accept' | 'reject') => {
        setWorkstreams(prev => prev.map(ws => {
            if (ws.id !== activeWorkstreamId) return ws;
            return {
                ...ws,
                messages: ws.messages.map(msg => {
                    if (msg.id === messageId && msg.proposal) {
                        return { ...msg, proposal: { ...msg.proposal, status: action === 'accept' ? 'accepted' : 'rejected' } };
                    }
                    return msg;
                }),
            };
        }));

        if (action === 'accept') {
            const msg = activeWorkstream.messages.find(m => m.id === messageId);
            if (msg?.proposal) {
                const newClaim: Claim = {
                    id: 12,
                    type: 'independent',
                    category: 'method',
                    text: 'A method for adaptive sensor fusion in an autonomous vehicle...',
                    riskFlags: [],
                    children: [],
                };
                setClaims(prev => [...prev, newClaim]);
                setActiveTab('claims');
            }
        }
    };

    const handleWorkstreamChange = (id: string) => {
        setActiveWorkstreamId(id);
    };

    const handleCreateWorkstream = (type: WorkstreamType, label: string) => {
        const count = workstreams.filter(ws => ws.type === type).length;
        const newWs: Workstream = {
            id: `ws-${type}-${Date.now()}`,
            matterId,
            type,
            label: count > 0 ? `${label} #${count + 1}` : label,
            status: 'active',
            stage: 'brief',
            messages: [{
                id: `sys-${Date.now()}`,
                role: 'system',
                content: `${label} workstream created`,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            }],
            documents: [],
            createdAt: new Date().toISOString(),
        };
        setWorkstreams(prev => [...prev, newWs]);
        setActiveWorkstreamId(newWs.id);
    };

    return (
        <div style={{
            display: 'flex',
            height: '100%',
            overflow: 'hidden',
        }}>
            <ChatSidebar
                messages={activeWorkstream.messages}
                onSendMessage={handleSendMessage}
                onArtifactNavigate={(tab) => setActiveTab(tab as ArtifactTab)}
                onProposalAction={handleProposalAction}
                currentStage={currentStage}
                inputPrefill={chatInputPrefill}
                onClearPrefill={() => setChatInputPrefill('')}
                workstreams={workstreams}
                activeWorkstreamId={activeWorkstreamId}
                onWorkstreamChange={handleWorkstreamChange}
                onCreateWorkstream={handleCreateWorkstream}
                suggestions={suggestions}
                suggestionsLoading={suggestionsLoading}
                onWorkflowAction={handleWorkflowAction}
                onClaimNavigate={handleClaimNavigate}
                claims={claims}
                documents={documents}
                briefVersion={briefVersion}
            />
            <ArtifactPreview
                activeTab={activeTab}
                onTabChange={setActiveTab}
                claims={claims}
                onAddToChat={(text) => setChatInputPrefill(text)}
                fileWrapperDocs={documents}
                matterId={DEMO_MATTER_ID}
                briefVersion={briefVersion}
                onBriefUploadSuccess={handleBriefUploadSuccess}
                onApproveBrief={handleApproveBrief}
                isApprovingBrief={isApprovingBrief}
                claimVersion={claimVersion}
                onGenerateClaims={handleGenerateClaims}
                isGeneratingClaims={isGeneratingClaims}
                onCommitClaims={handleCommitClaims}
                isCommittingClaims={isCommittingClaims}
                briefApproved={briefApproved}
                highlightedClaimId={highlightedClaimId}
                riskVersion={riskVersion}
                onGenerateRisk={handleGenerateRisk}
                isGeneratingRisk={isGeneratingRisk}
                onCommitRisk={handleCommitRisk}
                isCommittingRisk={isCommittingRisk}
                claimsApproved={claimsApproved}
                specVersion={specVersion}
                onGenerateSpec={handleGenerateSpec}
                isGeneratingSpec={isGeneratingSpec}
                onCommitSpec={handleCommitSpec}
                isCommittingSpec={isCommittingSpec}
                riskApproved={riskApproved}
                qaVersion={qaVersion}
                onRunQA={handleRunQA}
                isRunningQA={isRunningQA}
                onCommitQA={handleCommitQA}
                isCommittingQA={isCommittingQA}
                specApproved={specApproved}
                matterStatus={matter?.status}
                onLockForExport={handleLockForExport}
                isLocking={isLocking}
                onExportDocx={handleExportDocx}
                isExporting={isExporting}
            />
        </div>
    );
}
