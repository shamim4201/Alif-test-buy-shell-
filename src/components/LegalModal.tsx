import React, { useState } from 'react';
import { X, ShieldCheck, FileText, Lock, AlertTriangle, Scale } from 'lucide-react';

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'tos' | 'privacy' | 'refund' | 'safety';
}

export const LegalModal: React.FC<LegalModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'tos'
}) => {
  const [activeTab, setActiveTab] = useState<'tos' | 'privacy' | 'refund' | 'safety'>(initialTab);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-fade-in">
      <div className="relative w-full max-w-4xl bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] text-slate-800">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Scale className="w-5 h-5 text-red-600" />
            <h2 className="text-base font-bold text-slate-900">
              ChannelTrust Legal &amp; Compliance Center
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50/70 px-6 gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('safety')}
            className={`py-3 px-3 text-xs font-semibold border-b-2 whitespace-nowrap transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'safety'
                ? 'border-emerald-600 text-emerald-700 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            Brand Account Safety Standard
          </button>
          <button
            onClick={() => setActiveTab('tos')}
            className={`py-3 px-3 text-xs font-semibold border-b-2 whitespace-nowrap transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'tos'
                ? 'border-red-600 text-red-600 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <FileText className="w-4 h-4" />
            Terms of Service
          </button>
          <button
            onClick={() => setActiveTab('privacy')}
            className={`py-3 px-3 text-xs font-semibold border-b-2 whitespace-nowrap transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'privacy'
                ? 'border-red-600 text-red-600 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Lock className="w-4 h-4" />
            Privacy &amp; Redaction Policy
          </button>
          <button
            onClick={() => setActiveTab('refund')}
            className={`py-3 px-3 text-xs font-semibold border-b-2 whitespace-nowrap transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'refund'
                ? 'border-red-600 text-red-600 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
            Refund &amp; Dispute Arbitration
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-xs sm:text-sm text-slate-700 leading-relaxed">
          {activeTab === 'safety' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start gap-3">
                <ShieldCheck className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-emerald-900 text-sm">
                    Core Security Directive: Zero Password Sharing
                  </h4>
                  <p className="text-xs text-emerald-800 mt-1">
                    ChannelTrust strictly forbids sellers and buyers from requesting, exchanging, or transferring Google/Gmail account passwords. Transfers must ONLY occur through Google Brand Account Primary Ownership reassignment.
                  </p>
                </div>
              </div>

              <h3 className="text-base font-bold text-slate-900">The 5-Stage Safe Brand Account Protocol</h3>
              <ol className="list-decimal pl-5 space-y-3">
                <li>
                  <strong>Brand Account Conversion:</strong> If the channel is not already linked to a Brand Account, the seller creates a Brand Account in YouTube Studio and links the channel prior to listing.
                </li>
                <li>
                  <strong>Manager Invitation:</strong> Once buyer payment is server-verified in platform custody, the seller navigates to <em>YouTube Studio &gt; Settings &gt; Permissions</em> and invites the buyer’s clean Google Account email as <strong>Manager</strong>.
                </li>
                <li>
                  <strong>Mandatory 7-Day Google Cooldown:</strong> Per Google security architecture, a newly added user must remain a Manager for 7 consecutive days before being eligible for promotion to Primary Owner.
                </li>
                <li>
                  <strong>Primary Ownership Elevation:</strong> On Day 7, the seller elevates the buyer to <strong>Primary Owner</strong>. The seller then removes their own administrative role.
                </li>
                <li>
                  <strong>AdSense Relinking &amp; Fund Release:</strong> The buyer links their own approved Google AdSense property, verifies sole administrative access, and authorizes platform fund release to the seller.
                </li>
              </ol>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 text-xs">
                <strong>Anti-Fraud Warning:</strong> Any attempt to transact off-platform, send wires outside the platform verification workflow, or solicit personal login credentials will result in immediate permanent account termination and forfeiture of marketplace guarantees.
              </div>
            </div>
          )}

          {activeTab === 'tos' && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-slate-900">Terms of Service &amp; Seller Representations</h3>
              <p>
                Welcome to ChannelTrust. By creating an account or submitting an offer, you enter into a legally binding covenant regarding digital asset transfers.
              </p>

              <h4 className="font-bold text-slate-900 text-sm">1. Seller Warranties &amp; Clean Title</h4>
              <p>
                Every seller warrants that they are the sole lawful creator or rightful owner of the YouTube channel listed. The seller guarantees that the channel has zero undisclosed copyright strikes, zero active Community Guideline strikes, no pending strikes, and no fraudulent artificially inflated view metrics (botting).
              </p>

              <h4 className="font-bold text-slate-900 text-sm">2. Non-Circumvention</h4>
              <p>
                Buyers and sellers agree not to bypass ChannelTrust to execute transactions directly. Platform security guarantees and arbitration rights only apply to orders logged and verified inside ChannelTrust.
              </p>

              <h4 className="font-bold text-slate-900 text-sm">3. Custody &amp; Server-Side Payment Verification</h4>
              <p>
                All funds paid by buyers are verified server-side and recorded in the custody ledger. Funds remain secured until the buyer explicitly approves release upon receiving verified Primary Owner status, or until an arbitration ruling is enacted by ChannelTrust compliance officers.
              </p>
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-slate-900">Privacy Policy &amp; Data Protection</h3>
              <p>
                ChannelTrust collects only the minimum necessary data to verify channel provenance and facilitate the ownership transition.
              </p>

              <h4 className="font-bold text-slate-900 text-sm">Analytics Redaction</h4>
              <p>
                When sellers upload YouTube Studio screenshots, sensitive financial identifiers (such as bank routing numbers or personal AdSense publisher IDs) must be redacted. Public listing cards display aggregate analytics (subscribers, views, niche, geographic split) to preserve seller anonymity until a binding purchase offer is initiated.
              </p>

              <h4 className="font-bold text-slate-900 text-sm">Communication Privacy</h4>
              <p>
                Channel messages are encrypted in transit and inspected via automated safety filters solely to prevent credential fraud, scam URLs, and off-platform solicitation.
              </p>
            </div>
          )}

          {activeTab === 'refund' && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-slate-900">Refund, Dispute &amp; Arbitration Policy</h3>
              <p>
                Because digital media ownership is a sensitive asset class, ChannelTrust operates a clear 48-hour post-handover inspection guarantee.
              </p>

              <h4 className="font-bold text-slate-900 text-sm">Eligible Grounds for Full Buyer Refund:</h4>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>Seller fails to send Google Brand Account Manager invite within 72 hours of payment confirmation.</li>
                <li>Undisclosed active copyright strikes, Community Guideline strikes, or monetization demonetization occurred prior to transfer.</li>
                <li>Metrics differ by more than 25% from verified listing proof screenshots.</li>
                <li>Seller attempts to reclaim channel via Google account recovery mechanisms.</li>
              </ul>

              <h4 className="font-bold text-slate-900 text-sm">Arbitration Procedure</h4>
              <p>
                If a dispute is triggered by either party, funds are instantly frozen. A ChannelTrust arbitrator will inspect YouTube Studio audit logs, timestamped transfer messages, and screenshot records. Admin arbitration rulings are final.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Last revised: October 2026 • ChannelTrust Compliance
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition cursor-pointer"
          >
            I Understand &amp; Agree
          </button>
        </div>
      </div>
    </div>
  );
};
