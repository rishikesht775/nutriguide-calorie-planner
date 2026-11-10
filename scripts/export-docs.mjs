import {spawnSync} from 'node:child_process';
const command=process.env.DOCS_PYTHON||(process.platform==='win32'?'py':'python3');
const r=spawnSync(command,['scripts/export-application-doc.py'],{stdio:'inherit'});
if(r.error){console.error('Word export needs Python and scripts/docs-requirements.txt. Or download the generated Word artifact from GitHub Actions.');process.exitCode=1}else process.exitCode=r.status??1;
