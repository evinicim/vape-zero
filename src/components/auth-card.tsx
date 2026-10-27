import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
export function AuthCard({ title, desc, children }: { title: string; desc: string; children: React.ReactNode }) {
  return (<div className="mx-auto max-w-md px-4 py-12"><Card><CardHeader><CardTitle className="text-2xl"><h1>{title}</h1></CardTitle><CardDescription>{desc}</CardDescription></CardHeader><CardContent>{children}</CardContent></Card></div>);
}
