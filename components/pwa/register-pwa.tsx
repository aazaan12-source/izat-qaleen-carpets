"use client";

import { useEffect, useState } from "react";
import { Download, Smartphone, X } from "lucide-react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

export function RegisterPwa() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [serviceWorkerReady, setServiceWorkerReady] = useState(false);

  useEffect(() => {
    const navigatorWithStandalone = window.navigator as Navigator & { standalone?: boolean };
    setIsStandalone(window.matchMedia("(display-mode: standalone)").matches || navigatorWithStandalone.standalone === true);

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/service-worker.js").then(() => setServiceWorkerReady(true)).catch(() => setServiceWorkerReady(false));
    }

    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
  }, []);

  async function installApp() {
    if (!installPrompt) return;
    await installPrompt.prompt();
    await installPrompt.userChoice;
    setInstallPrompt(null);
    setDismissed(true);
  }

  if (dismissed || isStandalone) return null;

  return (
    <div className="fixed inset-x-3 bottom-20 z-[70] mx-auto max-w-md border border-[#D0B8A8] bg-[#F8EDE3] p-3 shadow-2xl sm:bottom-4">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center bg-[#111111] text-white">
          <Smartphone className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-black">Install IZAT QALEEN & CARPETS</p>
          <p className="mt-1 text-xs leading-5 text-[#5f5148]">
            {serviceWorkerReady ? "App mode is ready with offline shell support." : "Add this shop to your phone home screen for quicker access."}
          </p>
          <div className="mt-3 flex gap-2">
            {installPrompt ? (
              <button onClick={installApp} className="inline-flex h-9 items-center gap-2 bg-[#111111] px-3 text-xs font-black uppercase text-white">
                Install <Download className="h-4 w-4" />
              </button>
            ) : null}
            <button onClick={() => setDismissed(true)} className="inline-flex h-9 items-center gap-2 border border-[#D0B8A8] bg-[#DFD3C3] px-3 text-xs font-black uppercase">
              Later
            </button>
          </div>
        </div>
        <button onClick={() => setDismissed(true)} className="border border-[#D0B8A8] bg-[#F8EDE3] p-2" aria-label="Dismiss install prompt">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
