# 提取所有 Prompt 的方法

本文档介绍如何从 Prompt Recorder 系统中提取所有已保存的 prompt。

## 方法一：通过 API 导出（推荐）

### 1. 导出为 CSV 格式

在浏览器中访问或使用命令行：

```powershell
# 使用 PowerShell
Invoke-WebRequest -Uri "http://localhost:3001/api/prompts/export/csv" -OutFile "prompts.csv"

# 或者直接在浏览器中打开
# http://localhost:3001/api/prompts/export/csv
```

CSV 文件将包含以下列：
- ID
- Content（内容）
- Source（来源：browser/cursor/vscode/manual）
- URL（来源 URL）
- Timestamp（时间戳）
- Tags（标签）
- Category（分类）

### 2. 导出为 JSON 格式

```powershell
# 使用 PowerShell
Invoke-WebRequest -Uri "http://localhost:3001/api/prompts/export/json" -OutFile "prompts.json"

# 或者直接在浏览器中打开
# http://localhost:3001/api/prompts/export/json
```

JSON 文件将包含完整的 prompt 对象数组，包括所有元数据。

### 3. 使用 API 获取数据（编程方式）

```powershell
# 获取所有 prompts（带分页）
$response = Invoke-RestMethod -Uri "http://localhost:3001/api/prompts?limit=1000"
$response.prompts | ConvertTo-Json -Depth 10 | Out-File "prompts.json" -Encoding UTF8

# 搜索特定内容
$response = Invoke-RestMethod -Uri "http://localhost:3001/api/prompts?search=关键词"

# 按来源筛选
$response = Invoke-RestMethod -Uri "http://localhost:3001/api/prompts?source=browser"

# 按日期范围筛选
$response = Invoke-RestMethod -Uri "http://localhost:3001/api/prompts?startDate=2024-01-01&endDate=2024-12-31"
```

## 方法二：直接访问数据库文件

数据库文件位置：
```
backend/data/prompts.db
```

### 使用 SQLite 工具查看

1. 下载 SQLite 命令行工具或使用 SQLite Browser
2. 打开数据库文件：
   ```bash
   sqlite3 backend/data/prompts.db
   ```
3. 查询所有 prompts：
   ```sql
   SELECT * FROM prompts;
   ```
4. 导出为 CSV：
   ```sql
   .mode csv
   .headers on
   .output prompts.csv
   SELECT * FROM prompts;
   ```

### 使用 Node.js 脚本导出

创建 `export-prompts.js`：

```javascript
const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

async function exportPrompts() {
  const SQL = await initSqlJs();
  const dbPath = path.join(__dirname, 'backend', 'data', 'prompts.db');
  
  if (!fs.existsSync(dbPath)) {
    console.error('Database file not found:', dbPath);
    return;
  }
  
  const buffer = fs.readFileSync(dbPath);
  const db = new SQL.Database(new Uint8Array(buffer));
  
  const result = db.exec('SELECT * FROM prompts ORDER BY timestamp DESC');
  const prompts = result[0].values.map(row => ({
    id: row[0],
    content: row[1],
    source: row[2],
    url: row[3],
    timestamp: row[4],
    metadata: row[5] ? JSON.parse(row[5]) : null,
    tags: row[6],
    category: row[7]
  }));
  
  // 导出为 JSON
  fs.writeFileSync('prompts.json', JSON.stringify(prompts, null, 2), 'utf8');
  console.log(`Exported ${prompts.length} prompts to prompts.json`);
  
  // 导出为 CSV
  const csv = [
    'ID,Content,Source,URL,Timestamp,Tags,Category',
    ...prompts.map(p => [
      p.id,
      `"${(p.content || '').replace(/"/g, '""')}"`,
      p.source,
      p.url || '',
      p.timestamp,
      p.tags || '',
      p.category || ''
    ].join(','))
  ].join('\n');
  
  fs.writeFileSync('prompts.csv', csv, 'utf8');
  console.log(`Exported ${prompts.length} prompts to prompts.csv`);
  
  db.close();
}

exportPrompts().catch(console.error);
```

运行：
```bash
cd backend
node export-prompts.js
```

## 方法三：使用 Python 脚本

创建 `export-prompts.py`：

```python
import sqlite3
import json
import csv
from pathlib import Path

db_path = Path(__file__).parent / 'backend' / 'data' / 'prompts.db'

if not db_path.exists():
    print(f"Database not found: {db_path}")
    exit(1)

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# 获取所有 prompts
cursor.execute('SELECT * FROM prompts ORDER BY timestamp DESC')
columns = [description[0] for description in cursor.description]
prompts = [dict(zip(columns, row)) for row in cursor.fetchall()]

# 导出为 JSON
with open('prompts.json', 'w', encoding='utf-8') as f:
    json.dump(prompts, f, ensure_ascii=False, indent=2)

# 导出为 CSV
with open('prompts.csv', 'w', newline='', encoding='utf-8') as f:
    writer = csv.DictWriter(f, fieldnames=columns)
    writer.writeheader()
    writer.writerows(prompts)

print(f"Exported {len(prompts)} prompts to prompts.json and prompts.csv")

conn.close()
```

运行：
```bash
python export-prompts.py
```

## 清除所有测试数据

如果需要清除所有已保存的 prompts（测试数据）：

```powershell
# 使用 API
Invoke-RestMethod -Uri "http://localhost:3001/api/prompts/all" -Method Delete

# 或者直接删除数据库文件（会重新创建空数据库）
Remove-Item "backend/data/prompts.db"
```

## 注意事项

1. **确保后端服务正在运行**：所有 API 方法都需要后端服务在 `http://localhost:3001` 运行
2. **数据备份**：在清除数据前，建议先导出备份
3. **文件编码**：导出文件使用 UTF-8 编码，支持中文等多语言字符
4. **大文件处理**：如果 prompt 数量很大（>10000），可能需要调整 API 的 limit 参数或直接访问数据库

## 快速命令参考

```powershell
# 导出 CSV
Invoke-WebRequest -Uri "http://localhost:3001/api/prompts/export/csv" -OutFile "prompts.csv"

# 导出 JSON
Invoke-WebRequest -Uri "http://localhost:3001/api/prompts/export/json" -OutFile "prompts.json"

# 清除所有数据
Invoke-RestMethod -Uri "http://localhost:3001/api/prompts/all" -Method Delete

# 查看统计信息
Invoke-RestMethod -Uri "http://localhost:3001/api/prompts/stats/summary"
```
