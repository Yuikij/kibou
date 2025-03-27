"use strict";(self.webpackChunkmy_website=self.webpackChunkmy_website||[]).push([[9158],{89096:(e,t,r)=>{r.r(t),r.d(t,{default:()=>R});var s=r(96540),a=r(84897),o=r(44404),n=r(83375),i=r(18419),l=r(19534),c=r(81200),d=r(19188),x=r(51610),f=r(30461),p=r(74848);const{Title:h,Text:y}=n.A,g=o.Ay.div`
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  gap: 20px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(235, 47, 150, 0.15);
  backdrop-filter: blur(4px);
  border: 1px solid rgba(235, 47, 150, 0.18);
`,m=o.Ay.canvas`
  border: 2px solid #eb2f96;
  border-radius: 12px;
  background: #fff;
  margin: 20px 0;
  box-shadow: 0 0 20px rgba(235, 47, 150, 0.1);
`,u=o.Ay.div`
  font-size: 24px;
  color: #eb2f96;
  margin-bottom: 20px;
  font-weight: bold;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
`,b=o.Ay.div`
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
`,w=(0,o.Ay)(i.A)`
  width: 250px;
  height: fit-content;
  .ant-card-head-title {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .ant-list-item {
    padding: 8px 0;
    border-bottom: 1px solid rgba(235, 47, 150, 0.15);
  }
`,A=20,j=20,k=()=>{const e=(0,s.useRef)(null),[t,r]=(0,s.useState)(0),[a,o]=(0,s.useState)(0),[n,i]=(0,s.useState)([]);(0,s.useEffect)((()=>{const e=localStorage.getItem("snakeHighScore");e&&o(parseInt(e));const t=localStorage.getItem("snakeScoreHistory");t&&i(JSON.parse(t))}),[]);const[k,S]=(0,s.useState)(!1),[v,I]=(0,s.useState)(!1),[T,C]=(0,s.useState)([{x:10,y:10}]),[E,H]=(0,s.useState)({x:15,y:15}),[R,L]=(0,s.useState)("RIGHT"),[M,D]=(0,s.useState)(150),[z,B]=(0,s.useState)(!1),O=(0,s.useCallback)((()=>{const e={x:Math.floor(Math.random()*A),y:Math.floor(Math.random()*A)};H(e)}),[]);(0,s.useEffect)((()=>{if(k||v)return;const e=setInterval((()=>{C((e=>{const t=[...e],s={...t[0]};switch(R){case"UP":s.y-=1;break;case"DOWN":s.y+=1;break;case"LEFT":s.x-=1;break;case"RIGHT":s.x+=1}return s.x<0||s.x>=A||s.y<0||s.y>=A||t.some((e=>e.x===s.x&&e.y===s.y))?(S(!0),e):(t.unshift(s),s.x===E.x&&s.y===E.y?(r((e=>e+10)),O(),D((e=>Math.max(.95*e,50)))):t.pop(),t)}))}),M);return()=>clearInterval(e)}),[R,E,k,v,O,M]),(0,s.useEffect)((()=>{const e=e=>{if(!k)switch(["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"," "].includes(e.key)&&e.preventDefault(),e.key){case"ArrowUp":"DOWN"!==R&&L("UP");break;case"ArrowDown":"UP"!==R&&L("DOWN");break;case"ArrowLeft":"RIGHT"!==R&&L("LEFT");break;case"ArrowRight":"LEFT"!==R&&L("RIGHT");break;case" ":I((e=>!e))}};return window.addEventListener("keydown",e),()=>window.removeEventListener("keydown",e)}),[R,k]),(0,s.useEffect)((()=>{const t=e.current,r=t.getContext("2d");r.clearRect(0,0,t.width,t.height),T.forEach(((e,t)=>{r.fillStyle=0===t?"#eb2f96":"#f5a3c7",r.shadowBlur=0===t?10:5,r.shadowColor="#eb2f96",r.fillRect(e.x*j,e.y*j,18,18),r.shadowBlur=0})),r.fillStyle="#722ed1",r.shadowBlur=15,r.shadowColor="#722ed1",r.beginPath(),r.arc(E.x*j+10,E.y*j+10,8,0,2*Math.PI),r.fill(),r.shadowBlur=0}),[T,E]);const U=()=>{C([{x:10,y:10}]),L("RIGHT"),r(0),D(150),O(),S(!1),I(!1),B(!1)};return(0,p.jsxs)(g,{children:[(0,p.jsxs)("div",{style:{display:"flex",flexDirection:"column",alignItems:"center"},children:[(0,p.jsxs)(u,{children:["\u5206\u6570: ",t," ",(0,p.jsx)(x.A,{style:{color:"#faad14"}})," \u6700\u9ad8\u5206: ",a]}),(0,p.jsx)(m,{ref:e,width:400,height:400}),(0,p.jsxs)(b,{children:[(0,p.jsx)(l.Ay,{type:"primary",onClick:()=>I(!v),children:v?"\u7ee7\u7eed":"\u6682\u505c"}),(0,p.jsx)(l.Ay,{onClick:U,children:"\u91cd\u65b0\u5f00\u59cb"})]})]}),(0,p.jsx)(c.A,{title:"\u6e38\u620f\u7ed3\u675f",open:k&&!z,onOk:U,onCancel:()=>{S(!1),B(!0);const e=t>a;if(e){const e=t;o(e),"undefined"!=typeof window&&localStorage.setItem("snakeHighScore",e.toString())}const r=[{score:t,date:(new Date).toLocaleString(),isHighScore:e},...n].slice(0,10);i(r),"undefined"!=typeof window&&localStorage.setItem("snakeScoreHistory",JSON.stringify(r))},okText:"\u91cd\u65b0\u5f00\u59cb",cancelText:"\u5173\u95ed",width:400,children:(0,p.jsxs)("div",{style:{textAlign:"center",padding:"20px 0"},children:[(0,p.jsxs)(h,{level:2,style:{color:"#eb2f96",marginBottom:"20px"},children:[t,"\u5206"]}),t>a&&(0,p.jsx)(y,{type:"success",style:{fontSize:"18px",display:"block",marginBottom:"15px"},children:"\ud83c\udf89 \u606d\u559c\u4f60\u521b\u9020\u4e86\u65b0\u7684\u6700\u9ad8\u5206\uff01"}),(0,p.jsxs)(y,{type:"secondary",children:["\u5386\u53f2\u6700\u9ad8\u5206\uff1a",a,"\u5206"]})]})}),(0,p.jsx)(w,{title:(0,p.jsxs)(p.Fragment,{children:[(0,p.jsx)(f.A,{})," \u5386\u53f2\u8bb0\u5f55"]}),size:"small",children:(0,p.jsx)(d.A,{dataSource:n,renderItem:e=>(0,p.jsx)(d.A.Item,{children:(0,p.jsxs)("div",{style:{display:"flex",justifyContent:"space-between",width:"100%",alignItems:"center"},children:[(0,p.jsxs)(y,{style:{color:e.score>=a?"#eb2f96":"inherit"},children:[e.score,"\u5206 ",e.score>=a&&"\ud83c\udfc6"]}),(0,p.jsx)(y,{type:"secondary",style:{fontSize:"12px"},children:e.date})]})}),locale:{emptyText:"\u6682\u65e0\u8bb0\u5f55"}})})]})};var S=r(88762);const v=o.Ay.div`
  background: linear-gradient(135deg, #fff0f6 0%, #fff 100%);
  min-height: 90vh;
  padding: 2rem;
`,I=o.Ay.div`
  max-width: 800px;
  margin: 0 auto;
  text-align: center;
`,T=o.Ay.h1`
  color: #eb2f96;
  font-size: 2.5rem;
  margin-bottom: 1.5rem;
  font-family: 'Segoe UI', sans-serif;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
`,C=o.Ay.p`
  color: #722ed1;
  font-size: 1.2rem;
  margin-bottom: 2rem;
  font-style: italic;
`,E=o.Ay.div`
  position: absolute;
  color: #eb2f96;
  opacity: 0.6;
  animation: float 3s ease-in-out infinite;
  
  @keyframes float {
    0% { transform: translateY(0px); }
    50% { transform: translateY(-20px); }
    100% { transform: translateY(0px); }
  }
`,H=Array(6).fill(null);function R(){return(0,p.jsx)(a.A,{title:"\u5c0f\u7c73\u7684\u4e13\u5c5e\u6e38\u620f",description:"\u4e3a\u6700\u53ef\u7231\u7684\u5c0f\u7c73\u51c6\u5907\u7684\u7279\u522b\u6e38\u620f",children:(0,p.jsxs)(v,{children:[H.map(((e,t)=>(0,p.jsx)(E,{style:{top:80*Math.random()+"%",left:90*Math.random()+"%",fontSize:20+20*Math.random()+"px"},children:(0,p.jsx)(S.A,{})},t))),(0,p.jsxs)(I,{children:[(0,p.jsxs)(T,{children:["\u5c0f\u7c73\u7684\u4e13\u5c5e\u6e38\u620f",(0,p.jsx)(S.A,{style:{marginLeft:"10px",color:"#eb2f96"}})]}),(0,p.jsx)(C,{children:"\u4eb2\u7231\u7684\u5c0f\u7c73\uff0c\u5e0c\u671b\u4f60\u73a9\u5f97\u5f00\u5fc3~ \u8fd9\u662f\u4e13\u95e8\u4e3a\u4f60\u5b9a\u5236\u7684\u53ef\u7231\u8d2a\u5403\u86c7"}),(0,p.jsx)(k,{})]})]})})}}}]);