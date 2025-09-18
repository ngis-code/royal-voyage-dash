import { Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { SupportedLanguage } from "@/hooks/useLanguage";

interface LanguageSelectorProps {
  availableLanguages: SupportedLanguage[];
  selectedLanguage: string;
  onLanguageChange: (languageCode: string) => void;
  compact?: boolean;
}

export const LanguageSelector = ({
  availableLanguages,
  selectedLanguage,
  onLanguageChange,
  compact = false
}: LanguageSelectorProps) => {
  const currentLanguage = availableLanguages.find(lang => lang.code === selectedLanguage) || availableLanguages[0];

  if (availableLanguages.length <= 1) {
    return null;
  }

  if (compact) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="gap-1 h-6 px-2">
            <span className="text-xs">{currentLanguage?.flag}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48 bg-popover/95 backdrop-blur-sm border shadow-lg z-50">
          {availableLanguages.map((language) => (
            <DropdownMenuItem
              key={language.code}
              onClick={() => onLanguageChange(language.code)}
              className="flex items-center justify-between hover:bg-accent/80 cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <span>{language.flag}</span>
                <span className="text-sm">{language.name}</span>
              </div>
              {language.code === selectedLanguage && (
                <Badge variant="secondary" className="text-xs bg-primary/20 text-primary">
                  Current
                </Badge>
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Globe className="w-4 h-4" />
          {currentLanguage ? (
            <>
              <span>{currentLanguage.flag}</span>
              <span>{currentLanguage.name}</span>
            </>
          ) : (
            'Select Language'
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 bg-popover/95 backdrop-blur-sm border shadow-lg z-50">
        {availableLanguages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => onLanguageChange(language.code)}
            className="flex items-center justify-between cursor-pointer hover:bg-accent/80"
          >
            <div className="flex items-center gap-3">
              <span className="text-lg">{language.flag}</span>
              <span>{language.name}</span>
            </div>
            {language.code === selectedLanguage && (
              <Badge variant="secondary" className="text-xs bg-primary/20 text-primary">
                Selected
              </Badge>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};