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
import { Matter, BriefVersion, ClaimGraphVersion } from '@/types';

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

    const DEMO_MATTER_ID = matterId === '1' ? "123e4567-e89b-12d3-a456-426614174000" : matterId;

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

    useEffect(() => {
        refreshMatter();
        refreshBrief();
        refreshClaims();
    }, [refreshMatter, refreshBrief, refreshClaims]);

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
    }, [refreshBrief, refreshMatter]);

    // Brief approval handler
    const handleApproveBrief = useCallback(async () => {
        if (!briefVersion) return;
        setIsApprovingBrief(true);
        try {
            await mattersService.approveBrief(DEMO_MATTER_ID, briefVersion.id);
            await refreshBrief();
            await refreshMatter();
        } catch (err) {
            console.error("Failed to approve brief", err);
        } finally {
            setIsApprovingBrief(false);
        }
    }, [DEMO_MATTER_ID, briefVersion, refreshBrief, refreshMatter]);

    // Claims generation handler
    const handleGenerateClaims = useCallback(async () => {
        setIsGeneratingClaims(true);
        try {
            const briefId = briefVersion?.is_authoritative ? briefVersion.id : undefined;
            await mattersService.generateClaims(DEMO_MATTER_ID, briefId);
            await refreshClaims();
            await refreshMatter();
            setActiveTab('claims');
        } catch (err) {
            console.error("Failed to generate claims", err);
        } finally {
            setIsGeneratingClaims(false);
        }
    }, [DEMO_MATTER_ID, briefVersion, refreshClaims, refreshMatter]);

    // Claims commit handler
    const handleCommitClaims = useCallback(async () => {
        if (!claimVersion) return;
        setIsCommittingClaims(true);
        try {
            await mattersService.commitClaims(DEMO_MATTER_ID, claimVersion.id);
            await refreshClaims();
            await refreshMatter();
        } catch (err) {
            console.error("Failed to commit claims", err);
        } finally {
            setIsCommittingClaims(false);
        }
    }, [DEMO_MATTER_ID, claimVersion, refreshClaims, refreshMatter]);

    const briefApproved = briefVersion?.is_authoritative === true;

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
            const response = await fetch(`${apiBase}/matters/${DEMO_MATTER_ID}/stream`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
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
            />
        </div>
    );
}
