import { Globe, Phone } from 'lucide-react'

export function AppFooter() {
  return (
    <footer className="w-full border-t bg-background py-6 text-sm text-muted-foreground mt-auto">
      <div className="container flex flex-col items-center justify-between gap-4 md:h-14 md:flex-row md:py-0">
        <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
          <p className="text-center leading-loose md:text-left">
            &copy; {new Date().getFullYear()} Leap IT. Todos os direitos reservados.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
          <a
            href="https://www.leapit.com.br"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 font-medium hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-md px-2 py-1"
          >
            <Globe className="h-4 w-4" />
            www.leapit.com.br
          </a>
          <a
            href="https://wa.me/5511910274502"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 font-medium hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-md px-2 py-1"
          >
            <Phone className="h-4 w-4" />
            (11) 91027-4502
          </a>
        </div>
      </div>
    </footer>
  )
}
