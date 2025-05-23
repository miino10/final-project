import { IconTablerBrandWhatsapp } from "@/components/icons/IconTablerBrandWhatsapp";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Mail, Send } from "lucide-react";

export const SendEmailDropdown: React.FC<{
  onSendEmail: () => Promise<void>;
  name: string;
}> = ({ onSendEmail, name }) => (
  <DropdownMenu>
    <DropdownMenuTrigger>
      <Button
        variant="outline"
        className="flex gap-1 justify-center items-center">
        <Send size={16} />
        <span className="hidden md:flex">{name}</span>
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent className="p-3">
      <DropdownMenuItem>
        <button onClick={onSendEmail} className="flex gap-1 items-center">
          <span>Via Email</span>
          <Mail size={15} className="text-yellow-500" />
        </button>
      </DropdownMenuItem>
      <DropdownMenuItem>
        <button className="flex items-center gap-1">
          <span>Via WhatsApp</span>
          <IconTablerBrandWhatsapp  className="text-green-500" />
        </button>
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
);
