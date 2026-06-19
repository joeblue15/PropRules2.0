"use client";
import { useState } from "react";
import toast from "react-hot-toast";
import { Toaster } from "react-hot-toast";
import { createClient } from "@/lib/supabase/client";
import { slugify } from "@/lib/utils";
import {
  Plus, ChevronDown, ChevronRight, Trash2, Copy,
  Save, LogOut, Settings, FileText, Bell, Tag, LayoutDashboard, Eye, EyeOff
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Prop, Update, Discount, HeroContent, SiteSettings } from "@/types";

type NavSection = "props" | "updates" | "discounts" | "hero" | "settings";

interface DashboardClientProps {
  initialProps: Prop[];
  initialUpdates: Update[];
  initialDiscounts: Discount[];
  initialHero: HeroContent | null;
  initialSettings: SiteSettings | null;
}

export function DashboardClient({
  initialProps,
  initialUpdates,
  initialDiscounts,
  initialHero,
  initialSettings,
}: DashboardClientProps) {
  const [nav, setNav] = useState<NavSection>("props");
  const supabase = createClient();

  async function signOut() {
    await supabase.auth.signOut();
    window.location.href = "/dashboard/login";
  }

  return (
    <div className="min-h-screen flex bg-[var(--background)]">
      <Toaster position="bottom-right" toastOptions={{
        style: { background: "var(--surface)", color: "var(--foreground)", border: "1px solid var(--border)", fontSize: "13px" }
      }} />

      {/* Sidebar */}
      <aside className="w-56 flex-shrink-0 bg-[var(--surface)] border-r border-[var(--border)] flex flex-col">
        <div className="p-4 border-b border-[var(--border)]">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-[var(--accent)] flex items-center justify-center">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
            </div>
            <span className="text-sm font-semibold">
              <span className="text-[var(--foreground)]">Prop</span>
              <span className="text-[var(--accent)]">Rules</span>
            </span>
            <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded bg-[var(--accent)]/15 text-[var(--accent)] font-medium">Admin</span>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-0.5">
          {([
            { id: "props", label: "Prop firms", Icon: LayoutDashboard },
            { id: "updates", label: "Actualizaciones", Icon: Bell },
            { id: "discounts", label: "Descuentos", Icon: Tag },
            { id: "hero", label: "Portada", Icon: FileText },
            { id: "settings", label: "Configuración", Icon: Settings },
          ] as { id: NavSection; label: string; Icon: React.ElementType }[]).map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => setNav(id)}
              className={cn(
                "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-colors text-left",
                nav === id
                  ? "bg-[var(--accent)]/10 text-[var(--accent)] font-medium"
                  : "text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface-hover)]"
              )}
            >
              <Icon className="w-3.5 h-3.5 flex-shrink-0" />
              {label}
            </button>
          ))}
        </nav>

        <div className="p-3 border-t border-[var(--border)]">
          <button
            onClick={signOut}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface-hover)] transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto p-6">
          {nav === "props" && <PropsSection initialProps={initialProps} />}
          {nav === "updates" && <UpdatesSection initialUpdates={initialUpdates} initialProps={initialProps} />}
          {nav === "discounts" && <DiscountsSection initialDiscounts={initialDiscounts} initialProps={initialProps} />}
          {nav === "hero" && <HeroSection initialHero={initialHero} />}
          {nav === "settings" && <SettingsSection initialSettings={initialSettings} />}
        </div>
      </main>
    </div>
  );
}

// ─────────────────────────────────────────
// PROPS SECTION
// ─────────────────────────────────────────
function PropsSection({ initialProps }: { initialProps: Prop[] }) {
  const supabase = createClient();
  const [props, setProps] = useState<Prop[]>(initialProps);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function createProp() {
    const name = prompt("Nombre de la prop firm:");
    if (!name) return;
    const slug = slugify(name);
    const { data, error } = await supabase
      .from("props")
      .insert({ name, slug, type: "CFD", active: true, order: props.length + 1 })
      .select()
      .single();
    if (error) { toast.error("Error al crear la prop"); return; }
    setProps([...props, data as Prop]);
    setExpanded(data.id);
    toast.success("Prop creada correctamente");
  }

  async function saveProp(prop: Prop) {
    setSaving(true);
    const { error } = await supabase
      .from("props")
      .update({
        name: prop.name,
        slug: prop.slug,
        type: prop.type,
        secondary_info: prop.secondary_info,
        badge_text: prop.badge_text,
        badge_color: prop.badge_color,
        active: prop.active,
        order: prop.order,
      })
      .eq("id", prop.id);
    setSaving(false);
    if (error) toast.error("Error al guardar. Intenta de nuevo.");
    else toast.success("Prop guardada correctamente");
  }

  async function deleteProp(id: string) {
    if (!confirm("¿Seguro que quieres eliminar esta prop?")) return;
    const { error } = await supabase.from("props").delete().eq("id", id);
    if (error) { toast.error("Error al eliminar"); return; }
    setProps(props.filter((p) => p.id !== id));
    toast.success("Prop eliminada");
  }

  async function duplicateProp(prop: Prop) {
    const newName = `${prop.name} (copia)`;
    const { data, error } = await supabase
      .from("props")
      .insert({ ...prop, id: undefined, name: newName, slug: slugify(newName), order: props.length + 1 })
      .select()
      .single();
    if (error) { toast.error("Error al duplicar"); return; }
    setProps([...props, data as Prop]);
    toast.success("Prop duplicada");
  }

  function updateLocal(id: string, changes: Partial<Prop>) {
    setProps(props.map((p) => (p.id === id ? { ...p, ...changes } : p)));
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-base font-semibold text-[var(--foreground)]">Prop firms</h1>
        <button onClick={createProp} className="flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] transition-colors">
          <Plus className="w-3.5 h-3.5" /> Nueva prop
        </button>
      </div>

      <div className="space-y-2">
        {props.map((prop) => (
          <div key={prop.id} className="rounded-xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
            {/* Header */}
            <button
              className="w-full flex items-center gap-3 p-4 hover:bg-[var(--surface-hover)] transition-colors text-left"
              onClick={() => setExpanded(expanded === prop.id ? null : prop.id)}
            >
              <div className="w-8 h-8 rounded-lg bg-[var(--background)] border border-[var(--border)] flex items-center justify-center flex-shrink-0">
                <span className="text-[9px] font-bold text-[var(--muted)] uppercase">{prop.name.slice(0, 3)}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[var(--foreground)]">{prop.name}</p>
                <p className="text-xs text-[var(--muted-2)]">
                  {prop.type} · {prop.active ? "Activa" : "Inactiva"} · Orden {prop.order}
                </p>
              </div>
              {expanded === prop.id ? <ChevronDown className="w-4 h-4 text-[var(--muted)]" /> : <ChevronRight className="w-4 h-4 text-[var(--muted)]" />}
            </button>

            {/* Body */}
            {expanded === prop.id && (
              <div className="border-t border-[var(--border)] p-4 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Nombre" value={prop.name} onChange={(v) => updateLocal(prop.id, { name: v })} />
                  <Field label="Slug" value={prop.slug} onChange={(v) => updateLocal(prop.id, { slug: v })} />
                  <SelectField label="Tipo" value={prop.type} options={["CFD", "Futuros"]} onChange={(v) => updateLocal(prop.id, { type: v as "CFD" | "Futuros" })} />
                  <Field label="Info secundaria" value={prop.secondary_info ?? ""} onChange={(v) => updateLocal(prop.id, { secondary_info: v })} />
                  <Field label="Texto del badge" value={prop.badge_text ?? ""} onChange={(v) => updateLocal(prop.id, { badge_text: v })} />
                  <SelectField label="Color del badge" value={prop.badge_color ?? ""} options={["", "success", "warning", "danger", "info"]} onChange={(v) => updateLocal(prop.id, { badge_color: v as any })} />
                  <NumberField label="Orden" value={prop.order} onChange={(v) => updateLocal(prop.id, { order: v })} />
                  <div>
                    <label className="block text-xs text-[var(--muted)] mb-1">Estado</label>
                    <button
                      onClick={() => updateLocal(prop.id, { active: !prop.active })}
                      className={cn("text-xs px-3 py-1.5 rounded-lg border transition-colors", prop.active ? "bg-[var(--success-bg)] text-[var(--success)] border-[var(--success)]/20" : "bg-[var(--border)] text-[var(--muted)] border-[var(--border)]")}
                    >
                      {prop.active ? "Activa" : "Inactiva"}
                    </button>
                  </div>
                </div>

                {/* Challenges */}
                <ChallengesSubsection propId={prop.id} challenges={prop.challenges ?? []} />

                {/* Actions */}
                <div className="flex items-center gap-2 pt-2 border-t border-[var(--border-subtle)]">
                  <button onClick={() => deleteProp(prop.id)} className="flex items-center gap-1.5 text-xs text-[var(--danger)] hover:bg-[var(--danger-bg)] px-3 py-1.5 rounded-lg transition-colors border border-[var(--danger)]/20">
                    <Trash2 className="w-3 h-3" /> Eliminar
                  </button>
                  <button onClick={() => duplicateProp(prop)} className="flex items-center gap-1.5 text-xs text-[var(--muted)] hover:bg-[var(--surface-hover)] px-3 py-1.5 rounded-lg transition-colors border border-[var(--border)]">
                    <Copy className="w-3 h-3" /> Duplicar
                  </button>
                  <button
                    onClick={() => saveProp(prop)}
                    disabled={saving}
                    className="ml-auto flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-50"
                  >
                    <Save className="w-3 h-3" />
                    {saving ? "Guardando..." : "Guardar"}
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
// CHALLENGES SUBSECTION
// ─────────────────────────────────────────
function ChallengesSubsection({ propId, challenges }: { propId: string; challenges: any[] }) {
  const supabase = createClient();
  const [list, setList] = useState(challenges);
  const [expanded, setExpanded] = useState<string | null>(null);

  async function createChallenge() {
    const name = prompt("Nombre del challenge:");
    if (!name) return;
    const { data, error } = await supabase
      .from("challenges")
      .insert({ prop_id: propId, name, slug: slugify(name), active: true, order: list.length + 1, tags: [] })
      .select()
      .single();
    if (error) { toast.error("Error al crear el challenge"); return; }
    setList([...list, data]);
    setExpanded(data.id);
    toast.success("Challenge creado correctamente");
  }

  async function saveChallenge(ch: any) {
    const { error } = await supabase
      .from("challenges")
      .update({ name: ch.name, slug: ch.slug, description: ch.description, tags: ch.tags, active: ch.active, order: ch.order, fine_print: ch.fine_print, last_updated: ch.last_updated })
      .eq("id", ch.id);
    if (error) toast.error("Error al guardar el challenge.");
    else toast.success("Challenge guardado correctamente");
  }

  async function deleteChallenge(id: string) {
    if (!confirm("¿Eliminar este challenge?")) return;
    const { error } = await supabase.from("challenges").delete().eq("id", id);
    if (error) { toast.error("Error al eliminar"); return; }
    setList(list.filter((c) => c.id !== id));
    toast.success("Challenge eliminado");
  }

  function updateLocal(id: string, changes: any) {
    setList(list.map((c) => (c.id === id ? { ...c, ...changes } : c)));
  }

  return (
    <div className="border border-[var(--border-subtle)] rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2.5 bg-[var(--background)]">
        <p className="text-xs font-semibold text-[var(--foreground)]">Challenges</p>
        <button onClick={createChallenge} className="flex items-center gap-1 text-[11px] text-[var(--accent)] hover:underline">
          <Plus className="w-3 h-3" /> Agregar
        </button>
      </div>

      <div className="divide-y divide-[var(--border-subtle)]">
        {list.map((ch) => (
          <div key={ch.id}>
            <button
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[var(--surface-hover)] transition-colors text-left"
              onClick={() => setExpanded(expanded === ch.id ? null : ch.id)}
            >
              <span className="text-xs text-[var(--foreground)] flex-1">{ch.name}</span>
              <span className={cn("text-[10px] px-1.5 py-0.5 rounded", ch.active ? "text-[var(--success)] bg-[var(--success-bg)]" : "text-[var(--muted)] bg-[var(--border)]")}>
                {ch.active ? "Activo" : "Inactivo"}
              </span>
              {expanded === ch.id ? <ChevronDown className="w-3.5 h-3.5 text-[var(--muted)]" /> : <ChevronRight className="w-3.5 h-3.5 text-[var(--muted)]" />}
            </button>

            {expanded === ch.id && (
              <div className="px-4 pb-4 space-y-3 border-t border-[var(--border-subtle)]">
                <div className="grid grid-cols-2 gap-3 pt-3">
                  <Field label="Nombre" value={ch.name} onChange={(v) => updateLocal(ch.id, { name: v })} />
                  <Field label="Slug" value={ch.slug} onChange={(v) => updateLocal(ch.id, { slug: v })} />
                  <div className="col-span-2">
                    <label className="block text-xs text-[var(--muted)] mb-1">Descripción</label>
                    <textarea
                      value={ch.description ?? ""}
                      onChange={(e) => updateLocal(ch.id, { description: e.target.value })}
                      rows={2}
                      className="w-full text-xs bg-[var(--background)] border border-[var(--border)] rounded-lg px-3 py-2 text-[var(--foreground)] outline-none focus:border-[var(--accent)] resize-none"
                    />
                  </div>
                  <Field label="Tags (separados por coma)" value={(ch.tags ?? []).join(", ")} onChange={(v) => updateLocal(ch.id, { tags: v.split(",").map((t: string) => t.trim()).filter(Boolean) })} />
                  <Field label="Última actualización" value={ch.last_updated ?? ""} onChange={(v) => updateLocal(ch.id, { last_updated: v })} type="date" />
                  <NumberField label="Orden" value={ch.order} onChange={(v) => updateLocal(ch.id, { order: v })} />
                  <div>
                    <label className="block text-xs text-[var(--muted)] mb-1">Estado</label>
                    <button onClick={() => updateLocal(ch.id, { active: !ch.active })} className={cn("text-xs px-3 py-1.5 rounded-lg border transition-colors", ch.active ? "bg-[var(--success-bg)] text-[var(--success)] border-[var(--success)]/20" : "bg-[var(--border)] text-[var(--muted)] border-[var(--border)]")}>
                      {ch.active ? "Activo" : "Inactivo"}
                    </button>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs text-[var(--muted)] mb-1">La letra pequeña</label>
                    <textarea value={ch.fine_print ?? ""} onChange={(e) => updateLocal(ch.id, { fine_print: e.target.value })} rows={4} className="w-full text-xs bg-[var(--background)] border border-[var(--border)] rounded-lg px-3 py-2 text-[var(--foreground)] outline-none focus:border-[var(--accent)] resize-none" placeholder="Observaciones, advertencias, datos curiosos..." />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button onClick={() => deleteChallenge(ch.id)} className="flex items-center gap-1.5 text-xs text-[var(--danger)] hover:bg-[var(--danger-bg)] px-2.5 py-1.5 rounded-lg border border-[var(--danger)]/20">
                    <Trash2 className="w-3 h-3" /> Eliminar
                  </button>
                  <button onClick={() => saveChallenge(ch)} className="ml-auto flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)]">
                    <Save className="w-3 h-3" /> Guardar
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
// UPDATES SECTION
// ─────────────────────────────────────────
function UpdatesSection({ initialUpdates, initialProps }: { initialUpdates: Update[]; initialProps: Prop[] }) {
  const supabase = createClient();
  const [updates, setUpdates] = useState<Update[]>(initialUpdates);
  const [form, setForm] = useState({ prop_id: "", title: "", detail: "", featured: false, active: true, date: new Date().toISOString().split("T")[0] });
  const [editId, setEditId] = useState<string | null>(null);

  async function save() {
    if (!form.prop_id || !form.title) { toast.error("Selecciona una prop y agrega un título"); return; }
    if (editId) {
      const { error } = await supabase.from("updates").update(form).eq("id", editId);
      if (error) { toast.error("Error al guardar"); return; }
      setUpdates(updates.map((u) => u.id === editId ? { ...u, ...form } : u));
      toast.success("Actualización guardada");
    } else {
      const { data, error } = await supabase.from("updates").insert(form).select("*, prop:props(id,name,slug,logo_url)").single();
      if (error) { toast.error("Error al publicar"); return; }
      setUpdates([data as Update, ...updates]);
      toast.success("Actualización publicada");
    }
    setForm({ prop_id: "", title: "", detail: "", featured: false, active: true, date: new Date().toISOString().split("T")[0] });
    setEditId(null);
  }

  async function deleteUpdate(id: string) {
    if (!confirm("¿Eliminar esta actualización?")) return;
    const { error } = await supabase.from("updates").delete().eq("id", id);
    if (error) { toast.error("Error al eliminar"); return; }
    setUpdates(updates.filter((u) => u.id !== id));
    toast.success("Actualización eliminada");
  }

  function edit(u: Update) {
    setEditId(u.id);
    setForm({ prop_id: u.prop_id, title: u.title, detail: u.detail ?? "", featured: u.featured, active: u.active, date: u.date });
  }

  return (
    <div>
      <h1 className="text-base font-semibold text-[var(--foreground)] mb-6">Actualizaciones</h1>

      {/* Form */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4 mb-6 space-y-3">
        <p className="text-xs font-semibold text-[var(--foreground)]">{editId ? "Editar actualización" : "Nueva actualización"}</p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-[var(--muted)] mb-1">Prop firm</label>
            <select value={form.prop_id} onChange={(e) => setForm({ ...form, prop_id: e.target.value })} className="w-full text-xs bg-[var(--background)] border border-[var(--border)] rounded-lg px-3 py-2 text-[var(--foreground)] outline-none focus:border-[var(--accent)]">
              <option value="">Seleccionar...</option>
              {initialProps.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <Field label="Fecha" value={form.date} onChange={(v) => setForm({ ...form, date: v })} type="date" />
          <div className="col-span-2">
            <Field label="Título" value={form.title} onChange={(v) => setForm({ ...form, title: v })} />
          </div>
          <div className="col-span-2">
            <label className="block text-xs text-[var(--muted)] mb-1">Detalle</label>
            <textarea value={form.detail} onChange={(e) => setForm({ ...form, detail: e.target.value })} rows={3} className="w-full text-xs bg-[var(--background)] border border-[var(--border)] rounded-lg px-3 py-2 text-[var(--foreground)] outline-none focus:border-[var(--accent)] resize-none" />
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-xs text-[var(--muted)] cursor-pointer">
              <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} className="rounded" />
              Destacado
            </label>
            <label className="flex items-center gap-2 text-xs text-[var(--muted)] cursor-pointer">
              <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} className="rounded" />
              Visible
            </label>
          </div>
        </div>
        <div className="flex gap-2 pt-1">
          {editId && <button onClick={() => { setEditId(null); setForm({ prop_id: "", title: "", detail: "", featured: false, active: true, date: new Date().toISOString().split("T")[0] }); }} className="text-xs px-3 py-1.5 rounded-lg border border-[var(--border)] text-[var(--muted)]">Cancelar</button>}
          <button onClick={save} className="ml-auto flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-[var(--accent)] text-white">
            <Save className="w-3 h-3" /> {editId ? "Guardar cambios" : "Publicar"}
          </button>
        </div>
      </div>

      {/* List */}
      <div className="space-y-2">
        {updates.map((u) => (
          <div key={u.id} className="flex items-center gap-3 p-3 bg-[var(--surface)] border border-[var(--border)] rounded-xl">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-[var(--foreground)]">{(u as any).prop?.name ?? "—"}</span>
                {u.featured && <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--accent)]/15 text-[var(--accent)]">Destacado</span>}
                {!u.active && <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--border)] text-[var(--muted)]">Oculto</span>}
              </div>
              <p className="text-xs text-[var(--muted)] truncate">{u.title}</p>
              <p className="text-[11px] text-[var(--muted-2)]">{u.date}</p>
            </div>
            <button onClick={() => edit(u)} className="text-xs text-[var(--muted)] hover:text-[var(--foreground)] px-2 py-1 rounded">Editar</button>
            <button onClick={() => deleteUpdate(u.id)} className="text-xs text-[var(--danger)] hover:bg-[var(--danger-bg)] px-2 py-1 rounded">
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
// DISCOUNTS SECTION
// ─────────────────────────────────────────
function DiscountsSection({ initialDiscounts, initialProps }: { initialDiscounts: Discount[]; initialProps: Prop[] }) {
  const supabase = createClient();
  const [discounts, setDiscounts] = useState<Discount[]>(initialDiscounts);
  const [form, setForm] = useState({ prop_id: "", code: "", description: "", affiliate_url: "", active: true });
  const [editId, setEditId] = useState<string | null>(null);

  async function save() {
    if (!form.code) { toast.error("El código es obligatorio"); return; }
    if (editId) {
      const { error } = await supabase.from("discounts").update(form).eq("id", editId);
      if (error) { toast.error("Error al guardar"); return; }
      setDiscounts(discounts.map((d: any) => d.id === editId ? { ...d, ...form } : d));
      toast.success("Descuento guardado");
    } else {
      const { data, error } = await supabase.from("discounts").insert(form).select().single();
      if (error) { toast.error("Error al crear"); return; }
      setDiscounts([...discounts, data as Discount]);
      toast.success("Descuento creado");
    }
    setForm({ prop_id: "", code: "", description: "", affiliate_url: "", active: true });
    setEditId(null);
  }

  async function deleteDiscount(id: string) {
    if (!confirm("¿Eliminar?")) return;
    await supabase.from("discounts").delete().eq("id", id);
    setDiscounts(discounts.filter((d: any) => d.id !== id));
    toast.success("Descuento eliminado");
  }

  return (
    <div>
      <h1 className="text-base font-semibold text-[var(--foreground)] mb-6">Descuentos</h1>
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4 mb-6 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-[var(--muted)] mb-1">Prop firm</label>
            <select value={form.prop_id} onChange={(e) => setForm({ ...form, prop_id: e.target.value })} className="w-full text-xs bg-[var(--background)] border border-[var(--border)] rounded-lg px-3 py-2 text-[var(--foreground)] outline-none">
              <option value="">Seleccionar...</option>
              {initialProps.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <Field label="Código" value={form.code} onChange={(v) => setForm({ ...form, code: v })} />
          <Field label="Descripción" value={form.description} onChange={(v) => setForm({ ...form, description: v })} />
          <Field label="URL de afiliado" value={form.affiliate_url} onChange={(v) => setForm({ ...form, affiliate_url: v })} />
        </div>
        <div className="flex gap-2">
          {editId && <button onClick={() => { setEditId(null); setForm({ prop_id: "", code: "", description: "", affiliate_url: "", active: true }); }} className="text-xs px-3 py-1.5 rounded-lg border border-[var(--border)] text-[var(--muted)]">Cancelar</button>}
          <button onClick={save} className="ml-auto flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-[var(--accent)] text-white">
            <Save className="w-3 h-3" /> Guardar
          </button>
        </div>
      </div>
      <div className="space-y-2">
        {discounts.map((d: any) => (
          <div key={d.id} className="flex items-center gap-3 p-3 bg-[var(--surface)] border border-[var(--border)] rounded-xl">
            <div className="flex-1">
              <p className="text-xs font-mono font-semibold text-[var(--foreground)]">{d.code}</p>
              <p className="text-xs text-[var(--muted)]">{d.prop?.name ?? "Sin prop asignada"} · {d.description}</p>
            </div>
            <button onClick={() => { setEditId(d.id); setForm({ prop_id: d.prop_id, code: d.code, description: d.description ?? "", affiliate_url: d.affiliate_url ?? "", active: d.active }); }} className="text-xs text-[var(--muted)] hover:text-[var(--foreground)] px-2 py-1 rounded">Editar</button>
            <button onClick={() => deleteDiscount(d.id)} className="text-[var(--danger)] px-2 py-1"><Trash2 className="w-3 h-3" /></button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
// HERO SECTION
// ─────────────────────────────────────────
function HeroSection({ initialHero }: { initialHero: HeroContent | null }) {
  const supabase = createClient();
  const [hero, setHero] = useState(initialHero ?? { id: "", title_es: "", title_en: "" });
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    const { error } = await supabase.from("hero_content").update({ title_es: hero.title_es, title_en: hero.title_en }).eq("id", hero.id);
    setSaving(false);
    if (error) toast.error("Error al guardar");
    else toast.success("Portada actualizada");
  }

  return (
    <div>
      <h1 className="text-base font-semibold text-[var(--foreground)] mb-6">Portada</h1>
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4 space-y-3">
        <div>
          <label className="block text-xs text-[var(--muted)] mb-1">Título en español</label>
          <textarea value={hero.title_es} onChange={(e) => setHero({ ...hero, title_es: e.target.value })} rows={2} className="w-full text-sm bg-[var(--background)] border border-[var(--border)] rounded-lg px-3 py-2 text-[var(--foreground)] outline-none focus:border-[var(--accent)] resize-none" />
        </div>
        <div>
          <label className="block text-xs text-[var(--muted)] mb-1">Título en inglés</label>
          <textarea value={hero.title_en} onChange={(e) => setHero({ ...hero, title_en: e.target.value })} rows={2} className="w-full text-sm bg-[var(--background)] border border-[var(--border)] rounded-lg px-3 py-2 text-[var(--foreground)] outline-none focus:border-[var(--accent)] resize-none" />
        </div>
        <button onClick={save} disabled={saving} className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-[var(--accent)] text-white disabled:opacity-50">
          <Save className="w-3 h-3" /> {saving ? "Guardando..." : "Guardar cambios"}
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
// SETTINGS SECTION
// ─────────────────────────────────────────
function SettingsSection({ initialSettings }: { initialSettings: SiteSettings | null }) {
  const supabase = createClient();
  const [settings, setSettings] = useState(initialSettings ?? { id: "", updates_section_active: true, seo_title_es: "", seo_title_en: "", seo_description_es: "", seo_description_en: "" });
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    const { error } = await supabase.from("site_settings").update(settings).eq("id", settings.id);
    setSaving(false);
    if (error) toast.error("Error al guardar");
    else toast.success("Configuración guardada");
  }

  return (
    <div>
      <h1 className="text-base font-semibold text-[var(--foreground)] mb-6">Configuración</h1>
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-[var(--foreground)]">Sección de actualizaciones</p>
            <p className="text-xs text-[var(--muted)]">Mostrar u ocultar la sección en el home sin eliminar el contenido</p>
          </div>
          <button onClick={() => setSettings({ ...settings, updates_section_active: !settings.updates_section_active })} className={cn("flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-colors", settings.updates_section_active ? "bg-[var(--success-bg)] text-[var(--success)] border-[var(--success)]/20" : "bg-[var(--border)] text-[var(--muted)] border-[var(--border)]")}>
            {settings.updates_section_active ? <><Eye className="w-3 h-3" /> Visible</> : <><EyeOff className="w-3 h-3" /> Oculto</>}
          </button>
        </div>
        <div className="border-t border-[var(--border-subtle)] pt-4 space-y-3">
          <p className="text-xs font-semibold text-[var(--foreground)]">SEO global</p>
          <Field label="Título ES" value={settings.seo_title_es} onChange={(v) => setSettings({ ...settings, seo_title_es: v })} />
          <Field label="Título EN" value={settings.seo_title_en} onChange={(v) => setSettings({ ...settings, seo_title_en: v })} />
          <div>
            <label className="block text-xs text-[var(--muted)] mb-1">Descripción ES</label>
            <textarea value={settings.seo_description_es} onChange={(e) => setSettings({ ...settings, seo_description_es: e.target.value })} rows={2} className="w-full text-xs bg-[var(--background)] border border-[var(--border)] rounded-lg px-3 py-2 text-[var(--foreground)] outline-none focus:border-[var(--accent)] resize-none" />
          </div>
          <div>
            <label className="block text-xs text-[var(--muted)] mb-1">Descripción EN</label>
            <textarea value={settings.seo_description_en} onChange={(e) => setSettings({ ...settings, seo_description_en: e.target.value })} rows={2} className="w-full text-xs bg-[var(--background)] border border-[var(--border)] rounded-lg px-3 py-2 text-[var(--foreground)] outline-none focus:border-[var(--accent)] resize-none" />
          </div>
        </div>
        <button onClick={save} disabled={saving} className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-[var(--accent)] text-white disabled:opacity-50">
          <Save className="w-3 h-3" /> {saving ? "Guardando..." : "Guardar configuración"}
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
// SHARED FORM FIELDS
// ─────────────────────────────────────────
function Field({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <div>
      <label className="block text-xs text-[var(--muted)] mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full text-xs bg-[var(--background)] border border-[var(--border)] rounded-lg px-3 py-2 text-[var(--foreground)] outline-none focus:border-[var(--accent)] transition-colors"
      />
    </div>
  );
}

function NumberField({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div>
      <label className="block text-xs text-[var(--muted)] mb-1">{label}</label>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full text-xs bg-[var(--background)] border border-[var(--border)] rounded-lg px-3 py-2 text-[var(--foreground)] outline-none focus:border-[var(--accent)] transition-colors"
      />
    </div>
  );
}

function SelectField({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-xs text-[var(--muted)] mb-1">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full text-xs bg-[var(--background)] border border-[var(--border)] rounded-lg px-3 py-2 text-[var(--foreground)] outline-none focus:border-[var(--accent)] transition-colors"
      >
        {options.map((o) => <option key={o} value={o}>{o || "—"}</option>)}
      </select>
    </div>
  );
}
