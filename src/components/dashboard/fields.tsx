import type { ReactNode } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function Field({ label, name, value, type = "text", required = false }: { label: string; name: string; value?: string | number; type?: string; required?: boolean }) {
  return <div className="space-y-2"><Label htmlFor={name}>{label}</Label><Input id={name} name={name} defaultValue={value} type={type} required={required} min={type === "number" ? 0 : undefined} step={type === "number" ? "0.01" : undefined} /></div>;
}
export function SelectField({ label, name, value, children }: { label: string; name: string; value?: string; children: ReactNode }) {
  return <div className="space-y-2"><Label htmlFor={name}>{label}</Label><select className="h-10 w-full rounded-md border bg-background px-3 text-sm" id={name} name={name} defaultValue={value}>{children}</select></div>;
}
export function ToggleField({ label, name, checked }: { label: string; name: string; checked: boolean }) {
  return <label className="flex items-center gap-2 text-sm"><input type="checkbox" name={name} defaultChecked={checked} className="size-4 accent-primary" />{label}</label>;
}