const DB_NAME = 'DocumentEditorDB';
const DB_VERSION = 1;

function generateUUID(): string {
  return 'flow-' + Math.random().toString(36).substr(2, 9) + '-' + Date.now().toString(36);
}

async function initDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      if (!db.objectStoreNames.contains('documents')) {
        const docStore = db.createObjectStore('documents', { keyPath: 'id', autoIncrement: true });
        docStore.createIndex('title', 'title');
      }

      if (!db.objectStoreNames.contains('flowData')) {
        db.createObjectStore('flowData');
      }
    };
  });
}

async function createSampleDocument() {
  const db = await initDB();
  const erdFlowId = generateUUID();
  const flowchartFlowId = generateUUID();

  const document = {
    title: 'OAuth2 Authentication System',
    content: `<h1>OAuth2 Authentication System</h1>
<h2>Overview</h2>
<p>OAuth 2.0 is an authorization framework that enables applications to obtain limited access to user accounts on an HTTP service.</p>
<h2>Database Schema</h2>
<p>The following ERD diagram shows the core authentication entities:</p>
<div data-type="react-flow" data-flow-id="${erdFlowId}" data-diagram-type="erd" data-width="800" data-height="600"></div>
<h2>Authentication Flow</h2>
<ol>
<li>User clicks "Login with App"</li>
<li>Redirect to authorization server</li>
<li>User logs in and grants consent</li>
<li>Server returns authorization code</li>
<li>Client exchanges code for access token</li>
<li>Client accesses API with token</li>
</ol>
<h2>Core Entities</h2>
<p><strong>Users:</strong> Store user credentials and profile information</p>
<p><strong>OAuthApplications:</strong> Registered third-party applications</p>
<p><strong>AccessTokens:</strong> Short-lived tokens for API access</p>
<p><strong>RefreshTokens:</strong> Long-lived tokens for obtaining new access tokens</p>
<h2>Security</h2>
<p>• Use HTTPS for all communications<br>• Hash client secrets with bcrypt<br>• Implement PKCE for public clients<br>• Set appropriate token expiration times<br>• Validate all tokens on every request</p>
<h2>API Endpoints</h2>
<p>POST /oauth/authorize - Initiate authorization</p>
<p>POST /oauth/token - Exchange code for tokens</p>
<p>POST /oauth/revoke - Revoke tokens</p>`,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  const erdFlowData = {
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
          ],
        },
      },
    ],
    edges: [
      { id: 'e1', source: 'entity-2', target: 'entity-1', label: 'N:1' },
      { id: 'e2', source: 'entity-3', target: 'entity-1', label: 'N:1' },
      { id: 'e3', source: 'entity-3', target: 'entity-2', label: 'N:1' },
      { id: 'e4', source: 'entity-4', target: 'entity-1', label: 'N:1' },
      { id: 'e5', source: 'entity-4', target: 'entity-2', label: 'N:1' },
      { id: 'e6', source: 'entity-4', target: 'entity-3', label: '1:1' },
    ],
  };

  // Add document
  const docTx = db.transaction('documents', 'readwrite');
  const docStore = docTx.objectStore('documents');
  const docRequest = docStore.add(document);

  await new Promise((resolve, reject) => {
    docRequest.onsuccess = () => resolve(docRequest.result);
    docRequest.onerror = () => reject(docRequest.error);
  });

  const docId = docRequest.result;

  // Add ERD flow data
  const flowTx = db.transaction('flowData', 'readwrite');
  const flowStore = flowTx.objectStore('flowData');

  await new Promise((resolve, reject) => {
    const request1 = flowStore.put(erdFlowData, erdFlowId);
    request1.onerror = () => reject(request1.error);
    request1.onsuccess = () => {
      const request2 = flowStore.put({}, flowchartFlowId);
      request2.onerror = () => reject(request2.error);
      request2.onsuccess = () => resolve(request2.result);
    };
  });

  await new Promise((resolve, reject) => {
    flowTx.oncomplete = () => resolve(flowTx.result);
    flowTx.onerror = () => reject(flowTx.error);
  });

  console.log(`✅ Sample document created with ID: ${docId}`);
  console.log(`📄 Title: ${document.title}`);
  console.log(`🔗 ERD Flow ID: ${erdFlowId}`);
  console.log(`\n📊 Document includes:`);
  console.log(`   - 4 entities: Users, OAuthApplications, AccessTokens, RefreshTokens`);
  console.log(`   - 6 relationships with cardinality labels`);
  console.log(`   - Entity attributes with PK/FK indicators`);
  console.log(`\n🎯 Open http://localhost:5173 and click on "OAuth2 Authentication System" to view!`);
}

createSampleDocument().catch(console.error);
