import React, { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary capturou erro:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-rose-blush/40 text-center">
          <div className="bg-white p-8 rounded-3xl border border-rose-200 shadow-xl max-w-md w-full space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-rose-100 text-primary mx-auto flex items-center justify-center">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h2 className="font-display text-2xl font-bold text-foreground">
              Ops! Algo inesperado aconteceu.
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              O sistema detectou uma instabilidade transitória. Você pode recarregar a visualização ou retornar ao início com segurança.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button
                onClick={() => window.location.reload()}
                className="bg-primary hover:bg-rose-dark text-white font-bold rounded-xl flex-1 gap-2"
              >
                <RefreshCw className="w-4 h-4" /> Recarregar
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  window.location.href = "/";
                }}
                className="border-rose-200 rounded-xl flex-1 gap-2"
              >
                <Home className="w-4 h-4" /> Início
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
