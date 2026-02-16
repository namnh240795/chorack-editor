import { openDB } from 'idb';
import crypto from 'crypto';

interface Document {
  id?: number;
  title: string;
  content: string;
  createdAt: number;
  updatedAt: number;
}

interface FlowData {
  nodes: any[];
  edges: any[];
}

const DB_NAME = 'DocumentEditorDB';
const DB_VERSION = 1;

async function initDB() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('documents')) {
        const docStore = db.createObjectStore('documents', { keyPath: 'id', autoIncrement: true });
        docStore.createIndex('title', 'title');
      }
      if (!db.objectStoreNames.contains('flowData')) {
        db.createObjectStore('flowData');
      }
    },
  });
}

function generateUUID(): string {
  return 'flow-' + Math.random().toString(36).substr(2, 9) + '-' + Date.now().toString(36);
}

async function createSampleDocument() {
  const db = await initDB();

  // Generate flow IDs for the diagrams
  const erdFlowId = generateUUID();
  const flowchartFlowId = generateUUID();

  const document: Document = {
    title: 'OAuth2 Authentication System',
    content: `
<h1>OAuth2 Authentication System</h1>
<h2>Overview</h2>
<p>OAuth 2.0 is an authorization framework that enables applications to obtain limited access to user accounts on an HTTP service. This document describes the database schema and authentication flow for implementing OAuth2 in our system.</p>
<h2>Core Components</h2>
<h3>1. User Management</h3>
<p>The Users table stores user credentials and profile information. Each user has a unique ID, email, password hash, and metadata.</p>
<h3>2. OAuth Applications</h3>
<p>Third-party applications must register with our OAuth2 server to request access tokens. Each application has a client ID, client secret, and redirect URIs.</p>
<h3>3. Access Tokens</h3>
<p>Access tokens are issued to applications after successful authentication. Tokens include scopes, expiration times, and are associated with specific users and applications.</p>
<h3>4. Refresh Tokens</h3>
<p>Refresh tokens allow applications to obtain new access tokens without requiring user interaction. They are long-lived and must be securely stored.</p>
<h2>Authentication Flow</h2>
<p>The OAuth2 authorization code flow involves these steps:</p>
<ol>
<li><strong>Authorization Request</strong>: Client redirects user to authorization server</li>
<li><strong>User Consent</strong>: User logs in and grants permissions</li>
<li><strong>Authorization Code</strong>: Server returns authorization code to client</li>
<li><strong>Token Exchange</strong>: Client exchanges code for access token</li>
<li><strong>API Access</strong>: Client uses access token to access protected resources</li>
<li><strong>Token Refresh</strong>: Client uses refresh token to get new access token</li>
</ol>
<h2>Database Schema</h2>
<p>The following ERD diagram shows the relationships between the core authentication entities:</p>
<div data-type="react-flow" data-flow-id="${erdFlowId}" data-diagram-type="erd" data-width="800" data-height="600"></div>
<h2>Authentication Flow Diagram</h2>
<p>This flowchart illustrates the complete OAuth2 authorization code flow:</p>
<div data-type="react-flow" data-flow-id="${flowchartFlowId}" data-diagram-type="flowchart" data-width="700" data-height="500"></div>
<h2>Security Considerations</h2>
<h3>Token Storage</h3>
<ul>
<li>Access tokens should be stored securely (HttpOnly cookies or secure local storage)</li>
<li>Refresh tokens must be encrypted at rest</li>
<li>Implement token rotation for refresh tokens</li>
</ul>
<h3>Client Credentials</h3>
<ul>
<li>Client secrets should be hashed using bcrypt or similar</li>
<li>Implement PKCE (Proof Key for Code Exchange) for public clients</li>
<li>Use TLS 1.2+ for all communications</li>
</ul>
<h3>Authorization</h3>
<ul>
<li>Implement scope-based access control</li>
<li>Support role-based permissions</li>
<li>Allow users to revoke access for specific applications</li>
</ul>
<h2>API Endpoints</h2>
<h3>Authorization Endpoints</h3>
<ul>
<li><code>POST /oauth/authorize</code> - Initiate authorization flow</li>
<li><code>POST /oauth/token</code> - Exchange authorization code for tokens</li>
<li><code>POST /oauth/revoke</code> - Revoke access or refresh token</li>
</ul>
<h3>User Management</h3>
<ul>
<li><code>POST /api/users/register</code> - Register new user</li>
<li><code>POST /api/users/login</code> - User login</li>
<li><code>GET /api/users/me</code> - Get current user profile</li>
</ul>
<h2>Best Practices</h2>
<ol>
<li><strong>Use short-lived access tokens</strong> - 15-30 minutes expiration</li>
<li><strong>Implement token refresh</strong> - Use refresh tokens with longer lifetime (30 days)</li>
<li><strong>Validate all tokens</strong> - Check signature, expiration, and issuer</li>
<li><strong>Log authentication events</strong> - Track logins, token issuances, and revocations</li>
<li><strong>Rate limiting</strong> - Prevent brute force attacks on authorization endpoints</li>
<li><strong>HTTPS only</strong> - Never transmit tokens over unencrypted connections</li>
</ol>
<h2>Conclusion</h2>
<p>This OAuth2 implementation provides a secure, standards-compliant authentication system. The database schema ensures proper relationships between users, applications, and tokens while maintaining data integrity through foreign key constraints.</p>
`,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  // Insert document
  const docId = await db.put('documents', document);

  // Create ERD flow data
  const erdFlowData: FlowData = {
    nodes: [
      {
        id: 'entity-1',
        type: 'entity',
        position: { x: 100, y: 50 },
        data: {
          label: 'Users',
          attributes: [
            { name: 'id', type: 'INT', isPrimaryKey: true, isForeignKey: false, isNullable: false },
            { name: 'email', type: 'VARCHAR(255)', isPrimaryKey: false, isForeignKey: false, isNullable: false },
            { name: 'password_hash', type: 'VARCHAR(255)', isPrimaryKey: false, isForeignKey: false, isNullable: false },
            { name: 'created_at', type: 'TIMESTAMP', isPrimaryKey: false, isForeignKey: false, isNullable: false },
            { name: 'updated_at', type: 'TIMESTAMP', isPrimaryKey: false, isForeignKey: false, isNullable: true },
          ],
        },
      },
      {
        id: 'entity-2',
        type: 'entity',
        position: { x: 500, y: 50 },
        data: {
          label: 'OAuthApplications',
          attributes: [
            { name: 'id', type: 'INT', isPrimaryKey: true, isForeignKey: false, isNullable: false },
            { name: 'client_id', type: 'VARCHAR(255)', isPrimaryKey: false, isForeignKey: false, isNullable: false },
            { name: 'client_secret', type: 'VARCHAR(255)', isPrimaryKey: false, isForeignKey: false, isNullable: false },
            { name: 'name', type: 'VARCHAR(255)', isPrimaryKey: false, isForeignKey: false, isNullable: false },
            { name: 'redirect_uris', type: 'TEXT', isPrimaryKey: false, isForeignKey: false, isNullable: false },
            { name: 'user_id', type: 'INT', isPrimaryKey: false, isForeignKey: true, isNullable: false },
          ],
        },
      },
      {
        id: 'entity-3',
        type: 'entity',
        position: { x: 100, y: 400 },
        data: {
          label: 'AccessTokens',
          attributes: [
            { name: 'id', type: 'INT', isPrimaryKey: true, isForeignKey: false, isNullable: false },
            { name: 'token', type: 'VARCHAR(500)', isPrimaryKey: false, isForeignKey: false, isNullable: false },
            { name: 'user_id', type: 'INT', isPrimaryKey: false, isForeignKey: true, isNullable: false },
            { name: 'app_id', type: 'INT', isPrimaryKey: false, isForeignKey: true, isNullable: false },
            { name: 'scopes', type: 'VARCHAR(500)', isPrimaryKey: false, isForeignKey: false, isNullable: false },
            { name: 'expires_at', type: 'TIMESTAMP', isPrimaryKey: false, isForeignKey: false, isNullable: false },
            { name: 'created_at', type: 'TIMESTAMP', isPrimaryKey: false, isForeignKey: false, isNullable: false },
          ],
        },
      },
      {
        id: 'entity-4',
        type: 'entity',
        position: { x: 500, y: 400 },
        data: {
          label: 'RefreshTokens',
          attributes: [
            { name: 'id', type: 'INT', isPrimaryKey: true, isForeignKey: false, isNullable: false },
            { name: 'token', type: 'VARCHAR(500)', isPrimaryKey: false, isForeignKey: false, isNullable: false },
            { name: 'user_id', type: 'INT', isPrimaryKey: false, isForeignKey: true, isNullable: false },
            { name: 'app_id', type: 'INT', isPrimaryKey: false, isForeignKey: true, isNullable: false },
            { name: 'access_token_id', type: 'INT', isPrimaryKey: false, isForeignKey: true, isNullable: false },
            { name: 'revoked', type: 'BOOLEAN', isPrimaryKey: false, isForeignKey: false, isNullable: false },
            { name: 'expires_at', type: 'TIMESTAMP', isPrimaryKey: false, isForeignKey: false, isNullable: false },
          ],
        },
      },
    ],
    edges: [
      {
        id: 'edge-1',
        source: 'entity-2',
        target: 'entity-1',
        label: '1:N',
        data: { label: '1:N' },
      },
      {
        id: 'edge-2',
        source: 'entity-3',
        target: 'entity-1',
        label: 'N:1',
        data: { label: 'N:1' },
      },
      {
        id: 'edge-3',
        source: 'entity-3',
        target: 'entity-2',
        label: 'N:1',
        data: { label: 'N:1' },
      },
      {
        id: 'edge-4',
        source: 'entity-4',
        target: 'entity-1',
        label: 'N:1',
        data: { label: 'N:1' },
      },
      {
        id: 'edge-5',
        source: 'entity-4',
        target: 'entity-2',
        label: 'N:1',
        data: { label: 'N:1' },
      },
      {
        id: 'edge-6',
        source: 'entity-4',
        target: 'entity-3',
        label: '1:1',
        data: { label: '1:1' },
      },
    ],
  };

  // Create Flowchart flow data
  const flowchartFlowData: FlowData = {
    nodes: [
      {
        id: '1',
        type: 'input',
        position: { x: 250, y: 0 },
        data: { label: 'User clicks "Login with App"' },
      },
      {
        id: '2',
        type: 'default',
        position: { x: 200, y: 100 },
        data: { label: 'Redirect to /oauth/authorize' },
      },
      {
        id: '3',
        type: 'default',
        position: { x: 200, y: 200 },
        data: { label: 'User logs in & grants consent' },
      },
      {
        id: '4',
        type: 'default',
        position: { x: 200, y: 300 },
        data: { label: 'Server generates auth code' },
      },
      {
        id: '5',
        type: 'default',
        position: { x: 200, y: 400 },
        data: { label: 'Redirect back with auth code' },
      },
      {
        id: '6',
        type: 'default',
        position: { x: 400, y: 500 },
        data: { label: 'Client exchanges code for token' },
      },
      {
        id: '7',
        type: 'default',
        position: { x: 400, y: 600 },
        data: { label: 'Server validates & returns tokens' },
      },
      {
        id: '8',
        type: 'default',
        position: { x: 400, y: 700 },
        data: { label: 'Client stores tokens' },
      },
      {
        id: '9',
        type: 'output',
        position: { x: 350, y: 800 },
        data: { label: 'Access API with access token' },
      },
    ],
    edges: [
      { id: 'e1', source: '1', target: '2' },
      { id: 'e2', source: '2', target: '3' },
      { id: 'e3', source: '3', target: '4' },
      { id: 'e4', source: '4', target: '5' },
      { id: 'e5', source: '5', target: '6', label: 'Auth code' },
      { id: 'e6', source: '6', target: '7' },
      { id: 'e7', source: '7', target: '8' },
      { id: 'e8', source: '8', target: '9' },
    ],
  };

  // Store flow data
  await db.put('flowData', erdFlowData, erdFlowId);
  await db.put('flowData', flowchartFlowData, flowchartFlowId);

  console.log(`✅ Sample document created with ID: ${docId}`);
  console.log(`📄 Title: ${document.title}`);
  console.log(`🔗 ERD Flow ID: ${erdFlowId}`);
  console.log(`🔗 Flowchart Flow ID: ${flowchartFlowId}`);
  console.log(`\n📊 Document stats:`);
  console.log(`   - ${document.content.length} characters`);
  console.log(`   - 2 diagrams (1 ERD, 1 Flowchart)`);
  console.log(`   - 4 entities in ERD`);
  console.log(`   - 9 nodes in flowchart`);
  console.log(`\n🎯 Open http://localhost:5173 to view the document!`);
}

createSampleDocument().catch(console.error);
