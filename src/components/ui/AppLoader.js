export default function AppLoader() {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-5">
      <div className="flex flex-col items-center gap-3 animate-[pulse_2s_ease-in-out_infinite]">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent text-white text-2xl font-bold shadow-lg shadow-accent/30">
          W
        </span>
        <span className="text-lg font-semibold text-foreground tracking-tight">
          WorkHub
        </span>
      </div>

      <div className="w-48 h-1 rounded-full bg-muted-bg overflow-hidden">
        <div className="h-full w-1/2 rounded-full bg-gradient-to-r from-accent to-accent/50 animate-[loading-bar_1.2s_ease-in-out_infinite]" />
      </div>

      <p className="text-xs text-muted">Cargando...</p>
    </div>
  )
}
