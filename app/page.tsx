"use client";

import type { KeyboardEvent } from "react";
import { useEffect, useEffectEvent, useRef, useState } from "react";
import { MessageSquareText, Radio, SendHorizontal, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { ChatMessage, User } from "@/types/types";

import { socket } from "./socket";

function formatTime(timestamp: number) {
  return new Intl.DateTimeFormat("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(timestamp);
}

export default function Home() {
  const [isConnected, setIsConnected] = useState(false);
  const [transport, setTransport] = useState("N/A");
  const [user, setUser] = useState<User>({ username: "" });
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const trimmedUsername = user.username.trim();
  const trimmedInput = userInput.trim();
  const canSend =
    isConnected && trimmedUsername.length > 0 && trimmedInput.length > 0;
  const lastMessage = messages.at(-1);

  const handleIncomingMessage = useEffectEvent((incomingMessage: ChatMessage) => {
    if (incomingMessage.user.username === trimmedUsername) {
      return;
    }

    setMessages((currentMessages) => [...currentMessages, incomingMessage]);
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [messages]);

  useEffect(() => {
    function onUpgrade(nextTransport: { name: string }) {
      setTransport(nextTransport.name);
    }

    function onConnect() {
      setIsConnected(true);

      if (socket.io.engine) {
        setTransport(socket.io.engine.transport.name);
        socket.io.engine.on("upgrade", onUpgrade);
      }
    }

    function onDisconnect() {
      setIsConnected(false);
      setTransport("N/A");
    }

    if (socket.connected) {
      onConnect();
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("steve-chat", handleIncomingMessage);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("steve-chat", handleIncomingMessage);
      socket.io.engine?.off("upgrade", onUpgrade);
    };
  }, []);

  function sendMessage() {
    if (!canSend) {
      return;
    }

    const outgoingMessage: ChatMessage = {
      user: { username: trimmedUsername },
      content: trimmedInput,
      time: Date.now(),
    };

    socket.emit("chat", outgoingMessage);
    setMessages((currentMessages) => [...currentMessages, outgoingMessage]);
    setUserInput("");
  }

  function handleComposerKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden px-4 py-5 sm:px-6 lg:px-10 lg:py-8">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-8rem] top-[-4rem] h-56 w-56 rounded-full bg-[color:color-mix(in_oklab,var(--accent)_55%,white)] blur-3xl opacity-70 animate-pulse-glow" />
        <div className="absolute right-[-6rem] top-24 h-64 w-64 rounded-full bg-[color:color-mix(in_oklab,var(--secondary)_70%,white)] blur-3xl opacity-60 animate-float" />
        <div className="absolute bottom-[-10rem] left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-[color:color-mix(in_oklab,var(--primary)_24%,white)] blur-3xl opacity-55 animate-pulse-glow" />
      </div>

      <div className="relative mx-auto grid min-h-[calc(100dvh-2.5rem)] w-full max-w-7xl gap-6 lg:grid-cols-[minmax(300px,360px)_minmax(0,1fr)]">
        <aside className="glass-panel flex flex-col justify-between gap-5 rounded-[2rem] p-5 sm:p-6">
          <div className="space-y-5">
            <div className="space-y-4">
            

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  
                  <div>
                    <p className="text-sm font-medium text-foreground/60">
                      SteveChat
                    </p>
                    <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                      Une discussion plus claire, plus vivante.
                    </h1>
                  </div>
                </div>

                <p className="max-w-sm text-sm leading-6 text-muted-foreground sm:text-base">
                  Choisis un pseudo, rejoins le salon general, puis ecris comme
                  dans une vraie interface de messagerie plutot qu&apos;une simple
                  demo brute.
                </p>
              </div>
            </div>

            <Card className="gap-0 rounded-[1.75rem] border-white/55 bg-white/72 shadow-[0_20px_60px_-38px_rgba(15,23,42,0.45)]">
              <CardHeader className="px-4 pb-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <CardDescription className="text-foreground/65">
                      Etat du direct
                    </CardDescription>
                    <CardTitle className="mt-1 text-xl">
                      {isConnected ? "Connecte au salon" : "Connexion en attente"}
                    </CardTitle>
                  </div>
                  <Badge
                    variant={isConnected ? "success" : "warning"}
                    className="gap-2 px-3 py-1 font-semibold tracking-[0.18em] uppercase"
                  >
                    <Radio className="size-3.5" />
                    {isConnected ? "online" : "offline"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="grid gap-3 px-4 pt-0 text-sm text-muted-foreground sm:grid-cols-2">
                <Card className="gap-2 rounded-2xl border-black/5 bg-background/75 px-3 py-3 shadow-none">
                  <CardDescription className="px-0 text-[0.7rem] font-semibold tracking-[0.18em] uppercase text-foreground/50">
                    Transport
                  </CardDescription>
                  <CardTitle className="px-0 text-base">{transport}</CardTitle>
                </Card>
                <Card className="gap-2 rounded-2xl border-black/5 bg-background/75 px-3 py-3 shadow-none">
                  <CardDescription className="px-0 text-[0.7rem] font-semibold tracking-[0.18em] uppercase text-foreground/50">
                    Messages
                  </CardDescription>
                  <CardTitle className="px-0 text-base">{messages.length}</CardTitle>
                </Card>
              </CardContent>
            </Card>

            <Card className="gap-0 rounded-[1.75rem] border-white/55 bg-[color:color-mix(in_oklab,var(--background)_78%,white)] shadow-[0_20px_60px_-40px_rgba(15,23,42,0.45)]">
              <CardHeader className="px-4 pb-3">
                <CardTitle className="text-base">Profil</CardTitle>
                <CardDescription>
                  Ton nom apparait sur chaque message envoye.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 px-4 pt-0">
                <label className="space-y-2">
                  <span className="text-sm font-medium text-foreground">
                    Pseudo
                  </span>
                  <Input
                    className="h-12 rounded-2xl border-border/70 bg-white/85 px-4 text-base shadow-inner"
                    type="text"
                    placeholder="ex. Jean"
                    value={user.username}
                    onChange={(event) =>
                      setUser({ username: event.target.value })
                    }
                  />
                </label>

                <Card className="gap-2 rounded-2xl border-dashed border-border/70 bg-white/55 px-4 py-3 shadow-none">
                  <CardDescription className="px-0 text-[0.7rem] font-semibold tracking-[0.18em] uppercase text-foreground/45">
                    Identite active
                  </CardDescription>
                  <CardTitle className="px-0 text-base">
                    {trimmedUsername || "Aucun pseudo pour le moment"}
                  </CardTitle>
                </Card>
              </CardContent>
            </Card>
          </div>

          
        </aside>

        <section className="glass-panel flex min-h-[70dvh] flex-col rounded-[2rem] p-3 sm:p-4 lg:min-h-[calc(100dvh-4rem)]">
          <Card className="gap-0 rounded-[1.6rem] border-white/55 bg-white/65 py-4 shadow-[0_20px_50px_-38px_rgba(15,23,42,0.4)]">
            <CardHeader className="px-4 sm:px-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <CardDescription className="text-foreground/60">
                    Conversation principale
                  </CardDescription>
                  <CardTitle className="text-2xl sm:text-3xl">
                    Salon general
                  </CardTitle>
                </div>

                <Card className="gap-1 rounded-2xl border-black/5 bg-background/70 px-4 py-3 shadow-none">
                  <CardTitle className="px-0 text-sm">
                    {lastMessage
                      ? `Dernier message a ${formatTime(lastMessage.time)}`
                      : "Aucun message pour le moment"}
                  </CardTitle>
                  <CardDescription className="px-0">
                    {lastMessage
                      ? `Par ${lastMessage.user.username}`
                      : "Le salon attend la premiere prise de parole."}
                  </CardDescription>
                </Card>
              </div>
            </CardHeader>
          </Card>

          <div className="chat-scroll mt-3 flex-1 overflow-y-auto px-1 py-2 sm:px-2">
            {messages.length === 0 ? (
              <div className="flex h-full min-h-[360px] items-center justify-center p-4">
                <Card className="max-w-md rounded-[2rem] border-dashed border-border/80 bg-white/60 p-8 text-center shadow-[0_24px_80px_-50px_rgba(15,23,42,0.45)] backdrop-blur-xl">
                  <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-[color:color-mix(in_oklab,var(--accent)_55%,white)] text-foreground shadow-[0_20px_40px_-28px_rgba(15,23,42,0.35)]">
                    <MessageSquareText className="size-7" />
                  </div>
                  <CardTitle className="mt-5 text-xl">
                    Le salon est pret
                  </CardTitle>
                  <CardDescription className="mt-3 text-sm leading-6">
                    Ajoute un pseudo puis envoie ton premier message pour lancer
                    la conversation. L&apos;espace a ete pense pour rester lisible
                    meme quand la discussion commence a vivre.
                  </CardDescription>
                </Card>
              </div>
            ) : (
              <div className="flex flex-col gap-3 pb-4">
                {messages.map((chatMessage, index) => {
                  const isCurrentUser =
                    chatMessage.user.username === trimmedUsername;

                  return (
                    <article
                      key={`${chatMessage.time}-${chatMessage.user.username}-${index}`}
                      className={cn(
                        "message-enter flex max-w-[88%] gap-3 sm:max-w-[75%]",
                        isCurrentUser ? "ml-auto flex-row-reverse" : "mr-auto",
                      )}
                    >
                      <div
                        className={cn(
                          "mt-1 flex size-10 shrink-0 items-center justify-center rounded-2xl text-sm font-semibold shadow-[0_16px_30px_-24px_rgba(15,23,42,0.55)]",
                          isCurrentUser
                            ? "bg-[color:color-mix(in_oklab,var(--primary)_82%,white)] text-primary-foreground"
                            : "bg-[color:color-mix(in_oklab,var(--secondary)_34%,white)] text-foreground",
                        )}
                      >
                        {chatMessage.user.username.slice(0, 2).toUpperCase()}
                      </div>

                      <div
                        className={cn(
                          "rounded-[1.6rem] px-4 py-3 shadow-[0_20px_50px_-40px_rgba(15,23,42,0.5)]",
                          isCurrentUser
                            ? "bg-[linear-gradient(135deg,color-mix(in_oklab,var(--primary)_88%,white),color-mix(in_oklab,var(--accent)_55%,white))] text-primary-foreground"
                            : "border border-white/70 bg-white/78 text-foreground backdrop-blur-xl",
                        )}
                      >
                        <div
                          className={cn(
                            "flex items-center gap-3 text-xs font-medium uppercase tracking-[0.16em]",
                            isCurrentUser
                              ? "text-primary-foreground/80"
                              : "text-foreground/50",
                          )}
                        >
                          <span>{chatMessage.user.username}</span>
                          <span>{formatTime(chatMessage.time)}</span>
                        </div>
                        <p className="mt-2 whitespace-pre-wrap text-sm leading-6 sm:text-[0.95rem]">
                          {chatMessage.content}
                        </p>
                      </div>
                    </article>
                  );
                })}

                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          <Card className="mt-3 gap-0 rounded-[1.75rem] border-white/60 bg-white/72 py-3 shadow-[0_20px_50px_-40px_rgba(15,23,42,0.45)] backdrop-blur-x">
            <CardContent className="px-3 pt-0">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
              <label className="flex-1">
                <span className="sr-only">Votre message</span>
                <Textarea
                  className="min-h-28 resize-none rounded-[1.5rem] border-border/70 bg-background/85 px-4 py-3 text-base placeholder:text-muted-foreground/85"
                  placeholder={
                    trimmedUsername
                      ? "Ecris quelque chose au salon..."
                      : "Commence par choisir un pseudo..."
                  }
                  value={userInput}
                  onChange={(event) => setUserInput(event.target.value)}
                  onKeyDown={handleComposerKeyDown}
                />
              </label>

              <Button
                size="lg"
                className="h-14 rounded-[1.35rem] bg-[linear-gradient(135deg,color-mix(in_oklab,var(--primary)_92%,white),color-mix(in_oklab,var(--accent)_65%,white))] px-5 text-primary-foreground shadow-[0_22px_40px_-24px_color-mix(in_oklab,var(--primary)_65%,black)] hover:brightness-[1.03]"
                disabled={!canSend}
                onClick={sendMessage}
              >
                Envoyer
                <SendHorizontal />
              </Button>
              </div>

              <Separator className="my-3 bg-black/5" />

              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <Badge variant="outline" className="border-black/5 bg-background/70 px-3 py-1">
                {trimmedUsername || "Pseudo requis"}
                </Badge>
                <Badge variant="outline" className="border-black/5 bg-background/70 px-3 py-1">
                {isConnected ? "Pret a envoyer" : "Serveur non connecte"}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}
