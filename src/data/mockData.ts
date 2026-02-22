// ============================================
// CERTIS MOCK DATA
// Realistic patent drafting data for prototype
// ============================================

export interface Matter {
    id: string;
    name: string;
    jurisdiction: 'USPTO' | 'EPO' | 'JPO' | 'WIPO';
    status: 'BRIEF_UPLOADED' | 'BRIEF_ANALYZED' | 'CLAIMS_GENERATED' | 'SPEC_DRAFTED' | 'QA_COMPLETE' | 'EXPORT_READY';
    defensibilityScore: number;
    lastEdited: string;
    inventor: string;
    assignee: string;
    techDomain: string;
}

export interface Thread {
    id: string;
    title: string;
    category: 'drafting' | 'risk' | 'prosecution';
    lastActivity: string;
    badge?: string;
    type: 'authoritative' | 'exploratory' | 'analytical';
}

export interface DocumentReference {
    filename: string;
    page_number: number;
    content: string;
    document_id?: string;
    chunk_index?: number;
    content_type?: string;
    total_pages?: number;
}

export interface ChatMessage {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    thinking?: string;
    timestamp: string;
    proposal?: {
        title: string;
        description: string;
        status: 'pending' | 'accepted' | 'rejected';
        diff?: string;
    };
    references?: DocumentReference[];
}

export interface Claim {
    id: number;
    type: 'independent' | 'dependent';
    category: 'system' | 'method' | 'apparatus';
    text: string;
    dependsOn?: number;
    riskFlags?: { type: string; severity: 'low' | 'medium' | 'high' }[];
    children?: Claim[];
}

export interface RiskFlag {
    claimId: number;
    riskType: string;
    severity: 'low' | 'medium' | 'high';
    description: string;
}

export interface QAItem {
    id: string;
    type: 'error' | 'warning';
    location: string;
    message: string;
}

// ---- Matters ----
export const matters: Matter[] = [
    {
        id: 'matter-001',
        name: 'Autonomous Vehicle LiDAR Fusion System',
        jurisdiction: 'USPTO',
        status: 'CLAIMS_GENERATED',
        defensibilityScore: 78,
        lastEdited: '2 hours ago',
        inventor: 'Dr. Sarah Chen',
        assignee: 'NovaDrive Technologies Inc.',
        techDomain: 'Autonomous Vehicles / Sensor Fusion',
    },
    {
        id: 'matter-002',
        name: 'Quantum-Resistant Cryptographic Protocol',
        jurisdiction: 'EPO',
        status: 'SPEC_DRAFTED',
        defensibilityScore: 85,
        lastEdited: '1 day ago',
        inventor: 'Prof. Marcus Weber',
        assignee: 'CipherLattice GmbH',
        techDomain: 'Post-Quantum Cryptography',
    },
    {
        id: 'matter-003',
        name: 'Neural Interface for Prosthetic Control',
        jurisdiction: 'USPTO',
        status: 'BRIEF_ANALYZED',
        defensibilityScore: 62,
        lastEdited: '3 days ago',
        inventor: 'Dr. Aisha Patel',
        assignee: 'BioSync Medical Corp.',
        techDomain: 'Biomedical Engineering / BCI',
    },
    {
        id: 'matter-004',
        name: 'Distributed Ledger Consensus Mechanism',
        jurisdiction: 'WIPO',
        status: 'QA_COMPLETE',
        defensibilityScore: 91,
        lastEdited: '5 hours ago',
        inventor: 'James Liu',
        assignee: 'ChainCore Labs',
        techDomain: 'Distributed Systems / Blockchain',
    },
];

// ---- Threads ----
export const threads: Thread[] = [
    { id: 'thread-1', title: 'Main Draft', category: 'drafting', lastActivity: '2 min ago', badge: 'Claims Updated', type: 'authoritative' },
    { id: 'thread-2', title: 'Claim Strategy', category: 'drafting', lastActivity: '15 min ago', type: 'exploratory' },
    { id: 'thread-3', title: 'Embodiment Expansion', category: 'drafting', lastActivity: '1 hr ago', badge: 'Spec Expanded', type: 'authoritative' },
    { id: 'thread-4', title: 'Variant Exploration', category: 'drafting', lastActivity: '3 hrs ago', type: 'exploratory' },
    { id: 'thread-5', title: 'Litigation Analysis', category: 'risk', lastActivity: '30 min ago', badge: 'Risk Flag Added', type: 'analytical' },
    { id: 'thread-6', title: '112 Review', category: 'risk', lastActivity: '2 hrs ago', badge: '2 Warnings', type: 'analytical' },
    { id: 'thread-7', title: 'QA Reports', category: 'risk', lastActivity: '1 hr ago', type: 'analytical' },
    { id: 'thread-8', title: 'Office Action', category: 'prosecution', lastActivity: '1 day ago', type: 'authoritative' },
    { id: 'thread-9', title: 'Amendment Plan', category: 'prosecution', lastActivity: '2 days ago', type: 'exploratory' },
];

// ---- Chat Messages ----
export const chatMessages: ChatMessage[] = [
    {
        id: 'msg-sys-1',
        role: 'system',
        content: 'MATTER WORKSPACE INITIALIZED. AI ASSISTANT READY.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
];

// ---- Claim Tree ----
export const claimTree: Claim[] = [
    {
        id: 1,
        type: 'independent',
        category: 'system',
        text: 'A sensor fusion system for autonomous vehicle perception, comprising: a LiDAR preprocessing unit configured to convert raw point cloud data into a voxelized spatial representation; a visual feature extractor configured to generate feature maps from RGB image data; a cross-modal attention module configured to compute attention weights between corresponding spatial regions of the voxelized representation and the feature maps; and an object detection head configured to classify and localize objects based on the fused representation.',
        riskFlags: [{ type: 'Functional limitation', severity: 'medium' }],
        children: [
            { id: 2, type: 'dependent', category: 'system', text: 'The system of claim 1, wherein the cross-modal attention module employs a multi-head self-attention mechanism with learned positional encodings.', dependsOn: 1 },
            { id: 3, type: 'dependent', category: 'system', text: 'The system of claim 1, wherein the LiDAR preprocessing unit performs dynamic voxelization with adaptive grid resolution.', dependsOn: 1 },
            { id: 4, type: 'dependent', category: 'system', text: 'The system of claim 2, wherein the attention weights are computed using a scaled dot-product operation across spatial feature dimensions.', dependsOn: 2 },
            { id: 5, type: 'dependent', category: 'system', text: 'The system of claim 1, further comprising a temporal consistency engine configured to maintain object tracking across sequential frames.', dependsOn: 1 },
            { id: 6, type: 'dependent', category: 'system', text: 'The system of claim 1, wherein the system operates in a camera-only fallback mode with reduced confidence scoring when LiDAR data quality falls below a threshold.', dependsOn: 1 },
        ],
    },
    {
        id: 7,
        type: 'independent',
        category: 'method',
        text: 'A method for multi-sensor perception in an autonomous vehicle, comprising: receiving LiDAR point cloud data and camera image data; generating a voxelized spatial representation from the point cloud data; extracting visual feature maps from the camera image data; computing cross-modal attention weights between spatial regions of the voxelized representation and the visual feature maps to produce a fused representation; and detecting and classifying objects in the vehicle environment based on the fused representation.',
        riskFlags: [{ type: '§112(f) trigger', severity: 'high' }],
        children: [
            { id: 8, type: 'dependent', category: 'method', text: 'The method of claim 7, further comprising calibrating spatial alignment between the LiDAR and camera coordinate frames using extrinsic calibration parameters.', dependsOn: 7 },
            { id: 9, type: 'dependent', category: 'method', text: 'The method of claim 7, wherein computing cross-modal attention weights comprises applying a transformer encoder layer with cross-attention between modalities.', dependsOn: 7 },
            { id: 10, type: 'dependent', category: 'method', text: 'The method of claim 7, further comprising filtering spurious detections using temporal voting across a sliding window of consecutive frames.', dependsOn: 7 },
            { id: 11, type: 'dependent', category: 'method', text: 'The method of claim 9, wherein the transformer encoder layer comprises layer normalization, multi-head cross-attention, and a feed-forward network.', dependsOn: 9 },
        ],
    },
    {
        id: 13,
        type: 'independent',
        category: 'apparatus',
        text: 'A non-transitory computer-readable medium storing instructions that, when executed by a processor, cause the processor to perform the method of claim 7.',
        children: [
            { id: 14, type: 'dependent', category: 'apparatus', text: 'The computer-readable medium of claim 13, wherein the instructions further cause the processor to generate a confidence map indicating per-region detection reliability.', dependsOn: 13 },
        ],
    },
];

// ---- Risk Flags ----
export const riskFlags: RiskFlag[] = [
    { claimId: 1, riskType: 'Functional Limitation', severity: 'medium', description: '"object detection head" lacks structural specificity — could be construed broadly but may face enablement challenges.' },
    { claimId: 7, riskType: '§112(f) Trigger', severity: 'high', description: '"computing cross-modal attention weights" may invoke means-plus-function interpretation. Specification should include algorithmic detail.' },
    { claimId: 1, riskType: 'Ambiguous Term', severity: 'low', description: '"corresponding spatial regions" — consider defining correspondence criteria in the specification to avoid narrow construction.' },
];

// ---- QA Items ----
export const qaItems: QAItem[] = [
    { id: 'qa-1', type: 'warning', location: 'Claim 1, Element 4', message: 'Functional limitation detected: "object detection head configured to classify" — consider adding structural detail.' },
    { id: 'qa-2', type: 'error', location: 'Claim 7, Step 4', message: 'Potential §112(f) trigger: "computing cross-modal attention weights" — algorithmic detail required in specification.' },
    { id: 'qa-3', type: 'warning', location: 'Specification, ¶[0042]', message: 'Term "corresponding spatial regions" lacks explicit definition — may be subject to narrow claim construction.' },
    { id: 'qa-4', type: 'warning', location: 'Claim 6', message: 'Fallback mode functionality may benefit from additional embodiment detail in the specification.' },
];

// ---- Specification Sections ----
export const specSections = {
    background: `The present disclosure relates generally to autonomous vehicle perception systems, and more particularly to sensor fusion architectures that combine light detection and ranging (LiDAR) data with camera imagery for robust object detection in dynamic driving environments.

Conventional autonomous vehicle perception systems typically rely on either LiDAR-based or camera-based object detection independently. LiDAR systems provide accurate depth information but suffer from sparse spatial resolution and degradation in adverse weather conditions. Camera systems provide rich semantic information but lack reliable depth estimation. Existing fusion approaches, such as early concatenation or late decision-level fusion, fail to capture the complementary spatial relationships between these modalities effectively.

There remains a need for a sensor fusion approach that leverages the spatial complementarity between LiDAR and camera data through an attention-based mechanism that selectively weighs cross-modal features for improved detection accuracy and robustness.`,

    summary: `In accordance with aspects of the present disclosure, a sensor fusion system and method for autonomous vehicle perception is provided. The system comprises a LiDAR preprocessing unit, a visual feature extractor, a cross-modal attention module, and an object detection head. The cross-modal attention module computes attention weights between corresponding spatial regions of a voxelized LiDAR representation and camera feature maps, producing a fused representation that captures complementary information from both modalities. The system further provides a camera-only fallback mode for degraded LiDAR conditions.`,

    detailedDescription: `DETAILED DESCRIPTION

[0001] The following detailed description provides specific embodiments of the sensor fusion system and method. It should be understood that these embodiments are exemplary and not limiting.

[0002] FIG. 1 illustrates an overview of the sensor fusion system 100 according to an embodiment. The system 100 includes a LiDAR sensor 110, a camera array 120, a preprocessing pipeline 130, a cross-modal attention fusion module 140, and an object detection head 150.

[0003] The LiDAR preprocessing unit 130 receives raw point cloud data from the LiDAR sensor 110 and performs dynamic voxelization. In an embodiment, the voxelization employs an adaptive grid resolution that adjusts voxel size based on point density, ensuring efficient computation in both dense urban environments and sparse highway scenarios.

[0004] The visual feature extractor 135 processes RGB image data from the camera array 120 through a convolutional neural network backbone to produce multi-scale feature maps. In a preferred embodiment, the backbone comprises a ResNet-50 architecture with feature pyramid network (FPN) layers.

[0005] The cross-modal attention module 140 implements a transformer-based architecture. Specifically, the module computes attention weights using a scaled dot-product attention operation: Attention(Q, K, V) = softmax(QK^T / √d_k)V, where Q represents query vectors derived from one modality and K, V represent key-value pairs from the other modality. Multi-head attention is employed with h=8 attention heads operating in parallel across d_model=256 dimensional feature spaces.`,

    abstract: `A sensor fusion system for autonomous vehicle perception that combines LiDAR point cloud data with camera image data using a cross-modal attention mechanism. The system includes a LiDAR preprocessing unit for point cloud voxelization, a visual feature extractor for camera data, a cross-modal attention module computing attention weights between spatial regions across modalities, and an object detection head for classifying and localizing objects. The system supports a camera-only fallback mode for degraded LiDAR conditions.`,
};

// ---- Status Labels ----
export const statusLabels: Record<Matter['status'], { label: string; variant: string }> = {
    BRIEF_UPLOADED: { label: 'Brief Uploaded', variant: 'info' },
    BRIEF_ANALYZED: { label: 'Brief Analyzed', variant: 'info' },
    CLAIMS_GENERATED: { label: 'Claims Generated', variant: 'warning' },
    SPEC_DRAFTED: { label: 'Spec Drafted', variant: 'accent' },
    QA_COMPLETE: { label: 'QA Complete', variant: 'success' },
    EXPORT_READY: { label: 'Export Ready', variant: 'success' },
};

// ---- Workstreams ----
export type WorkstreamType = 'drafting' | 'prior_art' | 'oa_response' | 'ids' | 'custom';

export interface Workstream {
    id: string;
    matterId: string;
    type: WorkstreamType;
    label: string;
    status: 'active' | 'paused' | 'complete';
    stage: string;
    messages: ChatMessage[];
    documents: FileWrapperDocument[];
    createdAt: string;
}

export interface FileWrapperDocument {
    id: string;
    title: string;
    type: 'specification' | 'claims' | 'abstract' | 'ids' | 'oa_response' | 'amendment' | 'declaration' | 'drawing' | 'other';
    workstreamId: string;
    workstreamLabel: string;
    version: string;
    filedAt?: string;
    createdAt: string;
}

export const WORKSTREAM_TYPE_META: Record<WorkstreamType, { label: string; color: string; icon: string }> = {
    drafting: { label: 'Drafting', color: '#5D7052', icon: '✏️' },
    prior_art: { label: 'Prior Art Search', color: '#6B7C8C', icon: '🔍' },
    oa_response: { label: 'OA Response', color: '#C4813D', icon: '📋' },
    ids: { label: 'IDS Filing', color: '#7B5EA7', icon: '📑' },
    custom: { label: 'Custom', color: '#8D8D8A', icon: '⚙️' },
};

export const mockWorkstreams: Workstream[] = [
    {
        id: 'ws-drafting',
        matterId: 'matter-001',
        type: 'drafting',
        label: 'Initial Drafting',
        status: 'active',
        stage: 'claims',
        messages: chatMessages, // reuse existing chat messages for the drafting workstream
        documents: [
            { id: 'doc-1', title: 'Specification — Background & Summary', type: 'specification', workstreamId: 'ws-drafting', workstreamLabel: 'Initial Drafting', version: 'v1.0', createdAt: '2026-02-15T10:00:00Z' },
            { id: 'doc-2', title: 'Claims Set — 11 Independent, 36 Dependent', type: 'claims', workstreamId: 'ws-drafting', workstreamLabel: 'Initial Drafting', version: 'v1.0', createdAt: '2026-02-16T14:30:00Z' },
            { id: 'doc-3', title: 'Abstract', type: 'abstract', workstreamId: 'ws-drafting', workstreamLabel: 'Initial Drafting', version: 'v1.0', createdAt: '2026-02-16T15:00:00Z' },
            { id: 'doc-4', title: 'Drawings — 6 Figures', type: 'drawing', workstreamId: 'ws-drafting', workstreamLabel: 'Initial Drafting', version: 'v1.0', createdAt: '2026-02-17T09:00:00Z' },
        ],
        createdAt: '2026-02-14T08:00:00Z',
    },
    {
        id: 'ws-prior-art',
        matterId: 'matter-001',
        type: 'prior_art',
        label: 'Prior Art Search',
        status: 'complete',
        stage: 'qa',
        messages: [
            { id: 'pa-1', role: 'system', content: 'Prior Art Search workstream started', timestamp: '9:00 AM' },
            { id: 'pa-2', role: 'user', content: 'Search for prior art related to LiDAR-camera sensor fusion for autonomous vehicles, focusing on cross-modal attention mechanisms.', timestamp: '9:01 AM' },
            { id: 'pa-3', role: 'assistant', content: '**Prior Art Search Complete**\n\nI found **12 relevant references** across patent databases and academic literature:\n\n- **US 10,845,462** — "Multi-sensor fusion using attention networks" (Waymo, 2020)\n- **US 11,200,391** — "Cross-modal feature alignment for 3D object detection" (Toyota, 2021)\n- **WO 2022/041583** — "Point cloud and image fusion with transformer" (Baidu, 2022)\n\n**Risk Assessment:**\n- 3 references have moderate overlap with Claim 1 elements\n- 1 reference closely resembles the cross-modal attention mechanism in Claim 7\n\n*Recommend reviewing the Risk tab for detailed overlap analysis.*', timestamp: '9:15 AM' },
            { id: 'pa-4', role: 'user', content: 'Generate the IDS form with all 12 references.', timestamp: '9:20 AM' },
            { id: 'pa-5', role: 'assistant', content: '**IDS Generated**\n\nInformation Disclosure Statement prepared with 12 references:\n- 8 US Patents / Published Applications\n- 3 Foreign Patent Documents\n- 1 Non-Patent Literature (IEEE paper)\n\nAll references include required citation data (publication number, date, inventor, title). Ready for filing.', timestamp: '9:22 AM' },
        ],
        documents: [
            { id: 'doc-5', title: 'Prior Art Search Report — 12 References', type: 'other', workstreamId: 'ws-prior-art', workstreamLabel: 'Prior Art Search', version: 'v1.0', createdAt: '2026-02-18T09:15:00Z' },
            { id: 'doc-6', title: 'IDS — 12 References Cited', type: 'ids', workstreamId: 'ws-prior-art', workstreamLabel: 'Prior Art Search', version: 'v1.0', filedAt: '2026-02-19T10:00:00Z', createdAt: '2026-02-18T09:22:00Z' },
        ],
        createdAt: '2026-02-18T09:00:00Z',
    },
    {
        id: 'ws-oa-1',
        matterId: 'matter-001',
        type: 'oa_response',
        label: 'OA Response #1',
        status: 'paused',
        stage: 'brief',
        messages: [
            { id: 'oa-1', role: 'system', content: 'OA Response #1 workstream created — awaiting Office Action upload', timestamp: '2:00 PM' },
        ],
        documents: [],
        createdAt: '2026-02-19T14:00:00Z',
    },
];
