"use strict";(self.webpackChunkmy_website=self.webpackChunkmy_website||[]).push([[9158],{89096:(e,t,r)=>{r.r(t),r.d(t,{default:()=>v});var a=r(96540),o=r(84897),s=r(44404),n=r(35665),i=r(9990),l=r(51610),d=r(74848);const c=s.Ay.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(235, 47, 150, 0.15);
  backdrop-filter: blur(4px);
  border: 1px solid rgba(235, 47, 150, 0.18);
`,x=s.Ay.canvas`
  border: 2px solid #eb2f96;
  border-radius: 12px;
  background: #fff;
  margin: 20px 0;
  box-shadow: 0 0 20px rgba(235, 47, 150, 0.1);
`,f=s.Ay.div`
  font-size: 24px;
  color: #eb2f96;
  margin-bottom: 20px;
  font-weight: bold;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
`,h=s.Ay.div`
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
`,p=20,u=20,y=()=>{const e=(0,a.useRef)(null),[t,r]=(0,a.useState)(0),[o,s]=(0,a.useState)(0),[y,b]=(0,a.useState)(!1),[m,w]=(0,a.useState)(!1),[g,k]=(0,a.useState)([{x:10,y:10}]),[A,j]=(0,a.useState)({x:15,y:15}),[v,S]=(0,a.useState)("RIGHT"),[R,T]=(0,a.useState)(150),[C,E]=(0,a.useState)(!1),I=(0,a.useCallback)((()=>{const e={x:Math.floor(Math.random()*p),y:Math.floor(Math.random()*p)};j(e)}),[]);(0,a.useEffect)((()=>{if(y||m)return;const e=setInterval((()=>{k((e=>{const t=[...e],a={...t[0]};switch(v){case"UP":a.y-=1;break;case"DOWN":a.y+=1;break;case"LEFT":a.x-=1;break;case"RIGHT":a.x+=1}return a.x<0||a.x>=p||a.y<0||a.y>=p||t.some((e=>e.x===a.x&&e.y===a.y))?(b(!0),e):(t.unshift(a),a.x===A.x&&a.y===A.y?(r((e=>e+10)),I(),T((e=>Math.max(.95*e,50)))):t.pop(),t)}))}),R);return()=>clearInterval(e)}),[v,A,y,m,I,R]),(0,a.useEffect)((()=>{const e=e=>{if(!y)switch(["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"," "].includes(e.key)&&e.preventDefault(),e.key){case"ArrowUp":"DOWN"!==v&&S("UP");break;case"ArrowDown":"UP"!==v&&S("DOWN");break;case"ArrowLeft":"RIGHT"!==v&&S("LEFT");break;case"ArrowRight":"LEFT"!==v&&S("RIGHT");break;case" ":w((e=>!e))}};return window.addEventListener("keydown",e),()=>window.removeEventListener("keydown",e)}),[v,y]),(0,a.useEffect)((()=>{const t=e.current,r=t.getContext("2d");r.clearRect(0,0,t.width,t.height),g.forEach(((e,t)=>{r.fillStyle=0===t?"#eb2f96":"#f5a3c7",r.shadowBlur=0===t?10:5,r.shadowColor="#eb2f96",r.fillRect(e.x*u,e.y*u,18,18),r.shadowBlur=0})),r.fillStyle="#722ed1",r.shadowBlur=15,r.shadowColor="#722ed1",r.beginPath(),r.arc(A.x*u+10,A.y*u+10,8,0,2*Math.PI),r.fill(),r.shadowBlur=0}),[g,A]);const M=()=>{k([{x:10,y:10}]),S("RIGHT"),r(0),T(150),I(),b(!1),w(!1),E(!1)};return(0,d.jsxs)(c,{children:[(0,d.jsxs)(f,{children:["\u5206\u6570: ",t," ",(0,d.jsx)(l.A,{style:{color:"#faad14"}})," \u6700\u9ad8\u5206: ",o]}),(0,d.jsx)(x,{ref:e,width:400,height:400}),(0,d.jsxs)(h,{children:[(0,d.jsx)(n.Ay,{type:"primary",onClick:()=>w(!m),children:m?"\u7ee7\u7eed":"\u6682\u505c"}),(0,d.jsx)(n.Ay,{onClick:M,children:"\u91cd\u65b0\u5f00\u59cb"})]}),(0,d.jsxs)(i.A,{title:"\u6e38\u620f\u7ed3\u675f",open:y&&!C,onOk:M,onCancel:()=>{b(!1),E(!0),t>o&&s(t)},okText:"\u91cd\u65b0\u5f00\u59cb",cancelText:"\u5173\u95ed",children:[(0,d.jsxs)("p",{children:["\u6e38\u620f\u7ed3\u675f\uff01\u4f60\u7684\u5f97\u5206\u662f\uff1a",t]}),t>o&&(0,d.jsx)("p",{children:"\u606d\u559c\u4f60\u521b\u9020\u4e86\u65b0\u7684\u6700\u9ad8\u5206\uff01"})]})]})};var b=r(88762);const m=s.Ay.div`
  background: linear-gradient(135deg, #fff0f6 0%, #fff 100%);
  min-height: 90vh;
  padding: 2rem;
`,w=s.Ay.div`
  max-width: 800px;
  margin: 0 auto;
  text-align: center;
`,g=s.Ay.h1`
  color: #eb2f96;
  font-size: 2.5rem;
  margin-bottom: 1.5rem;
  font-family: 'Segoe UI', sans-serif;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
`,k=s.Ay.p`
  color: #722ed1;
  font-size: 1.2rem;
  margin-bottom: 2rem;
  font-style: italic;
`,A=s.Ay.div`
  position: absolute;
  color: #eb2f96;
  opacity: 0.6;
  animation: float 3s ease-in-out infinite;
  
  @keyframes float {
    0% { transform: translateY(0px); }
    50% { transform: translateY(-20px); }
    100% { transform: translateY(0px); }
  }
`,j=Array(6).fill(null);function v(){return(0,d.jsx)(o.A,{title:"\u5c0f\u7c73\u7684\u4e13\u5c5e\u6e38\u620f",description:"\u4e3a\u6700\u53ef\u7231\u7684\u5c0f\u7c73\u51c6\u5907\u7684\u7279\u522b\u6e38\u620f",children:(0,d.jsxs)(m,{children:[j.map(((e,t)=>(0,d.jsx)(A,{style:{top:80*Math.random()+"%",left:90*Math.random()+"%",fontSize:20+20*Math.random()+"px"},children:(0,d.jsx)(b.A,{})},t))),(0,d.jsxs)(w,{children:[(0,d.jsxs)(g,{children:["\u5c0f\u7c73\u7684\u4e13\u5c5e\u6e38\u620f",(0,d.jsx)(b.A,{style:{marginLeft:"10px",color:"#eb2f96"}})]}),(0,d.jsx)(k,{children:"\u4eb2\u7231\u7684\u5c0f\u7c73\uff0c\u5e0c\u671b\u4f60\u73a9\u5f97\u5f00\u5fc3~ \u8fd9\u662f\u4e13\u95e8\u4e3a\u4f60\u5b9a\u5236\u7684\u53ef\u7231\u8d2a\u5403\u86c7"}),(0,d.jsx)(y,{})]})]})})}}}]);