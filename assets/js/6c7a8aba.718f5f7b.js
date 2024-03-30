"use strict";(self.webpackChunkmy_website=self.webpackChunkmy_website||[]).push([[3258],{5133:(e,n,o)=>{o.r(n),o.d(n,{assets:()=>i,contentTitle:()=>d,default:()=>u,frontMatter:()=>s,metadata:()=>c,toc:()=>r});var t=o(85893),a=o(11151);const s={title:"Undo log"},d=void 0,c={id:"database/MySQL/\u65e5\u5fd7\u7cfb\u7edf/undoLog",title:"Undo log",description:"\u57fa\u672c\u6982\u5ff5",source:"@site/docs/database/MySQL/\u65e5\u5fd7\u7cfb\u7edf/undoLog.mdx",sourceDirName:"database/MySQL/\u65e5\u5fd7\u7cfb\u7edf",slug:"/database/MySQL/\u65e5\u5fd7\u7cfb\u7edf/undoLog",permalink:"/kibou/docs/database/MySQL/\u65e5\u5fd7\u7cfb\u7edf/undoLog",draft:!1,unlisted:!1,tags:[],version:"current",frontMatter:{title:"Undo log"},sidebar:"database",previous:{title:"Redo log",permalink:"/kibou/docs/database/MySQL/\u65e5\u5fd7\u7cfb\u7edf/redoLog"},next:{title:"CTE",permalink:"/kibou/docs/database/MySQL/\u67e5\u8be2\u8bed\u53e5/CTE"}},i={},r=[{value:"\u57fa\u672c\u6982\u5ff5",id:"\u57fa\u672c\u6982\u5ff5",level:2},{value:"\u914d\u7f6e",id:"\u914d\u7f6e",level:2}];function l(e){const n=Object.assign({h2:"h2",blockquote:"blockquote",p:"p",pre:"pre",code:"code"},(0,a.ah)(),e.components);return(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)(n.h2,{id:"\u57fa\u672c\u6982\u5ff5",children:"\u57fa\u672c\u6982\u5ff5"}),"\n",(0,t.jsxs)(n.blockquote,{children:["\n",(0,t.jsx)(n.p,{children:"An undo log is a collection of undo log records associated with a single read-write transaction. An undo log record contains information about how to undo the latest change by a transaction to a clustered index record"}),"\n"]}),"\n",(0,t.jsx)(n.p,{children:"\u8bb0\u5f55\u4e86\u4e00\u6761\u4e8b\u52a1\u91cc\u5bf9\u6570\u636e\u7684\u64cd\u4f5c\uff0c\u5305\u542b\u4e86\u5982\u4f55\u64a4\u9500\u6bcf\u4e2a\u64cd\u4f5c\u7684\u4fe1\u606f\uff0c\u5e76\u4e14\u7ed9mvcc\u63d0\u4f9b\u4e86\u53ef\u8ffd\u6eaf\u7684\u5386\u53f2\u7248\u672c\u7684\u89c6\u56fe"}),"\n",(0,t.jsx)(n.h2,{id:"\u914d\u7f6e",children:"\u914d\u7f6e"}),"\n",(0,t.jsx)(n.pre,{children:(0,t.jsx)(n.code,{className:"language-ini",children:"#\u5b9a\u4e49\u4e86\u5206\u914d\u7ed9\u6bcf\u4e2aundo\u8868\u7a7a\u95f4\u548c\u751f\u6210undo\u8bb0\u5f55\u7684\u4e8b\u52a1\u7684\u5168\u5c40\u4e34\u65f6\u8868\u7a7a\u95f4\u7684\u56de\u6eda\u6bb5\u7684\u6570\u91cf\u3002\u6bcf\u4e2a\u56de\u6eda\u6bb5\u652f\u6301\u7684\u4e8b\u52a1\u6570\u91cf\u53d6\u51b3\u4e8e InnoDB \u9875\u9762\u5927\u5c0f\u548c\u5206\u914d\u7ed9\u6bcf\u4e2a\u4e8b\u52a1\u7684\u64a4\u6d88\u65e5\u5fd7\u6570\u91cf\ninnodb_rollback_segments = 128\n#\u521b\u5efaundo tablespaces\u7684\u8def\u5f84 \ninnodb_undo_directory = \n"})})]})}const u=function(e={}){const{wrapper:n}=Object.assign({},(0,a.ah)(),e.components);return n?(0,t.jsx)(n,Object.assign({},e,{children:(0,t.jsx)(l,e)})):l(e)}},11151:(e,n,o)=>{o.d(n,{Zo:()=>c,ah:()=>s});var t=o(67294);const a=t.createContext({});function s(e){const n=t.useContext(a);return t.useMemo((()=>"function"==typeof e?e(n):{...n,...e}),[n,e])}const d={};function c({components:e,children:n,disableParentContext:o}){let c;return c=o?"function"==typeof e?e({}):e||d:s(e),t.createElement(a.Provider,{value:c},n)}}}]);