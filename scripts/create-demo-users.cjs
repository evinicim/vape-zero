const {createClient}=require("@supabase/supabase-js");
const sb=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.SUPABASE_SERVICE_ROLE_KEY,{auth:{persistSession:false},realtime:{transport:require("ws")}});
(async()=>{
 const ORG="00000000-0000-0000-0000-000000000001";
 const {data:cls}=await sb.from("class").select("id").eq("join_code","8A2026").single();
 const {data:list}=await sb.auth.admin.listUsers({perPage:1000});
 for (const [email,name,role] of [["aluno@demo.com","Aluno Demo","student"],["gestor@demo.com","Gestora Demo","educator"],["admin@demo.com","Admin Demo","admin"]]) {
  let u=list.users.find(x=>x.email===email);
  if(!u){const r=await sb.auth.admin.createUser({email,password:"demo1234",email_confirm:true,user_metadata:{name}}); if(r.error) throw r.error; u=r.data.user; console.log("criado",email);} else console.log("existe",email);
  const m=await sb.from("member").upsert({id:u.id,org_id:ORG,class_id:role==="student"?cls.id:null,role,display_name:name}); console.log("member",email,m.error?.message??"ok");
 }
})();
