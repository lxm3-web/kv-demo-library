#!/usr/bin/env python3
"""把 demo-library 的案例資料夾推到 Drive「Demo Website 展示作…」（走 01 的 GAS doPost，open@ 權限）。
用法：python3 push_to_drive.py [01 02 ...]   不給參數＝全部。排除 .git、_secrets、.DS_Store、*.tmp。"""
import os,sys,json,base64,mimetypes,urllib.request,re,time
B=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
env=dict(l.strip().split('=',1) for l in open(f'{B}/_secrets/01.env') if '=' in l and not l.startswith('#'))
URL=env['WEBAPP_URL']+'/exec'; SECRET=env['SECRET']
SKIP_DIR={'.git','_secrets','node_modules','__pycache__'}; SKIP_FILE={'.DS_Store','.gitkeep'}
def post(payload):
    req=urllib.request.Request(URL,data=json.dumps(payload).encode(),headers={'Content-Type':'text/plain'})
    class NoRedirect(urllib.request.HTTPRedirectHandler):
        def redirect_request(self,req,fp,code,msg,hdrs,newurl): return None
    op=urllib.request.build_opener(NoRedirect)
    for attempt in range(4):
        try:
            try: r=op.open(req); body=r.read()
            except urllib.error.HTTPError as e:
                if e.code==302: body=urllib.request.urlopen(e.headers['Location']).read()
                else: raise
            return json.loads(body)
        except Exception as e:
            err=e; time.sleep(2+attempt*3)
    return {'ok':False,'error':f'retry failed: {err}'}
def drive_name(local):  # 01_採購異常處理 → 01 採購異常處理
    return re.sub(r'^(\d\d)_',r'\1 ',local)
cases=sys.argv[1:] or sorted(d for d in os.listdir(f'{B}/cases') if re.match(r'\d\d_',d))
cases=[c if '_' in c else next(d for d in os.listdir(f'{B}/cases') if d.startswith(c+'_')) for c in cases]
n=0;bad=[]
for c in cases:
    root=f'{B}/cases/{c}'
    for dp,dn,fn in os.walk(root):
        dn[:]=[d for d in dn if d not in SKIP_DIR]
        for f in fn:
            if f in SKIP_FILE or f.endswith('.tmp') or f.endswith('.bak'): continue
            full=os.path.join(dp,f); rel=os.path.relpath(full,root)
            path=drive_name(c)+'/'+rel.replace(os.sep,'/')
            mime=mimetypes.guess_type(f)[0] or ('text/markdown' if f.endswith('.md') else 'application/octet-stream')
            b64=base64.b64encode(open(full,'rb').read()).decode()
            r=post({'secret':SECRET,'action':'putFile','path':path,'content_b64':b64,'mime':mime})
            if r.get('ok'): n+=1; print('✓',path)
            else: bad.append((path,r.get('error'))); print('✗',path,r.get('error'))
            time.sleep(0.3)
# 總表
r=post({'secret':SECRET,'action':'putFile','path':'00_編號對照總表.md','content_b64':base64.b64encode(open(f'{B}/00_編號對照總表.md','rb').read()).decode(),'mime':'text/markdown'})
print('✓ 00_編號對照總表.md' if r.get('ok') else r)
print(f'\n上傳 {n} 個檔，失敗 {len(bad)}')
