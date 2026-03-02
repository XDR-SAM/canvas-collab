import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import { Pencil, Users, Infinity, Download, Share2, Shield, Code2, ArrowRight, Star, Check } from "lucide-react";

const features = [
  { icon: Users, title: "Real-time Collaboration", desc: "Draw together with your team in real-time. See live cursors and changes instantly." },
  { icon: Infinity, title: "Infinite Canvas", desc: "Unlimited space to think big. Pan and zoom freely across your creative workspace." },
  { icon: Download, title: "Export Anywhere", desc: "Export your work as PNG, SVG, or JSON. Share with anyone, anywhere." },
  { icon: Share2, title: "Easy Sharing", desc: "Share boards via link. Control who can view or edit with granular permissions." },
  { icon: Shield, title: "Admin Control", desc: "Full admin dashboard to manage users, boards, analytics, and app settings." },
  { icon: Code2, title: "Developer Friendly", desc: "Built with modern tech stack. Clean, extensible, and open for customization." },
];

const steps = [
  { num: "1", title: "Create a Board", desc: "Sign up and create a new whiteboard in seconds." },
  { num: "2", title: "Draw & Collaborate", desc: "Use powerful tools to sketch, diagram, and brainstorm together." },
  { num: "3", title: "Share & Export", desc: "Share your work with a link or export it in multiple formats." },
];

const testimonials = [
  { name: "Sarah Chen", role: "Product Designer", text: "This tool transformed how our team brainstorms. The hand-drawn style makes everything feel more creative and approachable.", avatar: "SC" },
  { name: "Marcus Johnson", role: "Engineering Lead", text: "We replaced three different tools with this. The real-time collaboration is buttery smooth and the admin panel is incredibly useful.", avatar: "MJ" },
  { name: "Emily Park", role: "Startup Founder", text: "From wireframing to architecture diagrams, this is our go-to whiteboard. The free plan is generous and Pro is worth every penny.", avatar: "EP" },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden py-20 md:py-32">
        <div className="mx-auto max-w-7xl px-4 text-center">
          <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border bg-muted/50 px-4 py-1.5 text-sm text-muted-foreground">
            <Star className="h-3.5 w-3.5 fill-current" /> Now with real-time collaboration
          </div>
          <h1 className="mx-auto max-w-4xl text-5xl font-extrabold tracking-tight md:text-7xl">
            Where ideas come to{" "}
            <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">life</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl">
            A collaborative whiteboard with hand-drawn aesthetics. Sketch, diagram, and brainstorm together in real-time — beautifully.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Button size="lg" asChild className="h-12 px-8 text-base">
              <Link to="/signup">Start Drawing Free <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="h-12 px-8 text-base">
              <Link to="/login">Sign In</Link>
            </Button>
          </div>
          {/* Canvas mockup */}
          <div className="mx-auto mt-16 max-w-4xl rounded-2xl border bg-card p-4 shadow-2xl">
            <div className="aspect-video rounded-lg bg-muted/30 border-2 border-dashed border-border flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <Pencil className="mx-auto mb-3 h-12 w-12 opacity-40" />
                <p className="text-lg font-medium">Your canvas awaits</p>
                <p className="text-sm">Infinite possibilities, hand-drawn style</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t py-20 bg-muted/30">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="text-center text-3xl font-bold md:text-4xl">Everything you need to create</h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-muted-foreground">Powerful tools wrapped in a simple, beautiful interface.</p>
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <Card key={f.title} className="transition-shadow hover:shadow-lg">
                <CardHeader>
                  <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <f.icon className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{f.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">{f.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-t py-20">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="text-center text-3xl font-bold md:text-4xl">How it works</h2>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {steps.map((s) => (
              <div key={s.num} className="text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground text-xl font-bold">
                  {s.num}
                </div>
                <h3 className="text-lg font-semibold">{s.title}</h3>
                <p className="mt-2 text-muted-foreground text-sm">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="border-t py-20 bg-muted/30">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="text-center text-3xl font-bold md:text-4xl">Simple pricing</h2>
          <p className="mx-auto mt-4 max-w-xl text-center text-muted-foreground">Start free, upgrade when you need more.</p>
          <div className="mt-12 mx-auto grid max-w-3xl gap-8 md:grid-cols-2">
            {/* Free */}
            <Card className="relative">
              <CardHeader>
                <CardTitle>Free</CardTitle>
                <p className="text-3xl font-bold">$0<span className="text-base font-normal text-muted-foreground">/month</span></p>
              </CardHeader>
              <CardContent className="space-y-3">
                {["Up to 3 boards", "Basic drawing tools", "PNG export", "Public sharing"].map((f) => (
                  <div key={f} className="flex items-center gap-2 text-sm"><Check className="h-4 w-4 text-primary" />{f}</div>
                ))}
                <Button variant="outline" className="mt-4 w-full" asChild><Link to="/signup">Get Started</Link></Button>
              </CardContent>
            </Card>
            {/* Pro */}
            <Card className="relative border-primary">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-0.5 text-xs font-medium text-primary-foreground">Popular</div>
              <CardHeader>
                <CardTitle>Pro</CardTitle>
                <p className="text-3xl font-bold">$12<span className="text-base font-normal text-muted-foreground">/month</span></p>
              </CardHeader>
              <CardContent className="space-y-3">
                {["Unlimited boards", "Real-time collaboration", "All export formats", "Private boards & permissions", "Priority support"].map((f) => (
                  <div key={f} className="flex items-center gap-2 text-sm"><Check className="h-4 w-4 text-primary" />{f}</div>
                ))}
                <Button className="mt-4 w-full" asChild><Link to="/signup">Start Pro Trial</Link></Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="border-t py-20">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="text-center text-3xl font-bold md:text-4xl">Loved by teams</h2>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {testimonials.map((t) => (
              <Card key={t.name}>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground italic">"{t.text}"</p>
                  <div className="mt-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">{t.avatar}</div>
                    <div>
                      <p className="text-sm font-medium">{t.name}</p>
                      <p className="text-xs text-muted-foreground">{t.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 bg-muted/30">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center gap-2 font-bold">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
                <Pencil className="h-3.5 w-3.5 text-primary-foreground" />
              </div>
              DrawBoard
            </div>
            <p className="text-sm text-muted-foreground">© 2026 DrawBoard. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
