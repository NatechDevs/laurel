import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(fileURLToPath(new URL('../dist', import.meta.url)));
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.ttf':'font/ttf','.txt':'text/plain; charset=utf-8'};
const server=http.createServer(async(req,res)=>{
  try {
    const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
    const requested=path.resolve(root,'.'+pathname);
    if(requested!==root&&!requested.startsWith(root+path.sep)){res.writeHead(403);res.end();return;}
    let file=requested;
    if((await stat(file)).isDirectory())file=path.join(file,'index.html');
    const bytes=await readFile(file);
    res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream','X-Content-Type-Options':'nosniff'});
    res.end(bytes);
  }catch{res.writeHead(404,{'Content-Type':'text/plain; charset=utf-8'});res.end('Not found. Run npm run build before starting the preview.');}
});
server.listen(4180,'127.0.0.1',()=>console.log('Laurel preview: http://127.0.0.1:4180'));
