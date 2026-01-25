# Chiến lược: Atomic Write

function saveDataSafe(data: any) {
const tempFile = 'data.tmp.json';
const mainFile = 'data.json';

fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf-8');
fs.renameSync(tempFile, mainFile);
}

# Triển khai lưu trữ bằng: SQLite
