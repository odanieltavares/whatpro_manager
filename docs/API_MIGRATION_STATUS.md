# Quick Reference: API Client Migration

## Components - ✅ DONE
- ✅ paircode-generator.tsx - `apiClient.post` → `instancesApi.generatePaircode`
- ✅ qrcode-display.tsx - `apiClient.get` → `instancesApi.generateQRCode`
- ✅ status-display.tsx - `apiClient.get` → `instancesApi.getStatus`
- ✅ create-instance-dialog.tsx - `apiClient.post` → `instancesApi.create`

## Pages - ⏳ IN PROGRESS
- ✅ app/instances/page.tsx - `apiClient.getInstances` → `instancesApi.list`
- ⏳ app/instances/[id]/page.tsx - Multiple calls need replacement:
  - Line 47: `apiClient.get('/instances/${id}')` → `instancesApi.get(id)`
  - Line 75: `apiClient.put('/instances/${id}/behavior')` → `instancesApi.updateBehavior(id, data)`
  - Line 88: `apiClient.get('/instances/${id}/status')` → `instancesApi.getStatus(id)`
  - Line 99: `apiClient.get('/instances/${id}/qrcode')` → `instancesApi.generateQRCode(id)`
  - Line 111: `apiClient.post('/instances/${id}/disconnect')` → fetch (not in instancesApi)
  - Line 135: `apiClient.delete('/instances/${id}')` → `instancesApi.delete(id)`
  - Line 159: `apiClient.put('/instances/${id}/chatwoot')` → fetch (not in instancesApi)
- ⏭️  app/executions/page.tsx - No apiClient calls (import can be removed)

## Note
Some endpoints like `/disconnect` and `/chatwoot` are not in instancesApi and need direct fetch calls.
