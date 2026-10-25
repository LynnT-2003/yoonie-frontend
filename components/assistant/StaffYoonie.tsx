"use client";

import * as React from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogDescription, DialogTitle, SheetContent } from "@/components/ui/dialog";
import { YoonieMascot } from "@/components/mascot/YoonieMascot";
import { askStaffYoonie } from "@/lib/domain/assistant/assistant-api";
import { hospitalityKeys } from "@/lib/domain/hospitality/hospitality-api";
import { useAuth } from "@/providers/auth-provider";
import { YoonieChat } from "./YoonieChat";

const SUGGESTIONS = [
  "What's late today?",
  "Which rooms still need cleaning before arrivals?",
  "Where is today's next airport pickup?",
  "Any tours at risk of losing money?",
];

/**
 * "Ask Yoonie" in the ops dashboard. Yoonie acts as the signed-in user with their own
 * permissions, so anything it changes is a normal Yoonie action: boards refresh after each reply.
 */
export function StaffYoonie() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [open, setOpen] = React.useState(false);
  // one conversation per person per day, so yesterday's context doesn't leak into today
  const sessionId = `${user?._id ?? "staff"}-${new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Bangkok" })}`;
  const firstName = user?.displayName?.split(" ")[0];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button size="sm" variant="ghost" onClick={() => setOpen(true)} className="text-primary">
        <Sparkles /> Ask Yoonie
      </Button>
      <SheetContent size="sm" className="p-0">
        <div className="flex items-center gap-3 border-b border-border px-5 py-4 pr-14">
          <YoonieMascot mood="happy" size="xs" />
          <div>
            <DialogTitle className="text-sm font-semibold">Yoonie</DialogTitle>
            <DialogDescription className="text-xs">
              Ask about today, or tell me what to do. I act as you, with your permissions.
            </DialogDescription>
          </div>
        </div>
        <YoonieChat
          greeting={`Hi${firstName ? ` ${firstName}` : ""}! I can see today's rooms, pickups and tours, and I can move rooms, record pickup steps, decide tours and hand out jobs.`}
          suggestions={SUGGESTIONS}
          placeholder="e.g. Room 202 passed inspection"
          send={async (message) => (await askStaffYoonie({ sessionId, message })).reply}
          onReply={() => void queryClient.invalidateQueries({ queryKey: hospitalityKeys.all })}
        />
      </SheetContent>
    </Dialog>
  );
}
