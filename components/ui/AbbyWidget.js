'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { X, Send, Sparkles, ChevronDown } from 'lucide-react';
import { usePathname } from 'next/navigation';

// ─── Constants ───────────────────────────────────────────

const CATEGORIES = [
  'Service Questions',
  'Pricing',
  'Technical Support',
  'Billing',
  'Other',
];

const INITIAL_MESSAGE = {
  id: 'abby-init',
  role: 'assistant',
  content:
    "Hi! I'm Abby 👋 I'm Abode's AI assistant — here to answer questions about cost segregation and how our service works.\n\nQuick heads-up: I'm not a tax or legal advisor. For specific tax guidance, your CPA is the right call. I'm here to help you understand the service.\n\nWhat can I help you with today?",
};

// Routes where the floating bubble should not appear
const HIDE_BUBBLE_PATTERNS = [/^\/app\//, /\/checkout/, /\/payment/];

// ─── Helpers ─────────────────────────────────────────────

function track(event, props = {}) {
  if (typeof window !== 'undefined' && window.posthog) {
    window.posthog.capture(event, props);
  }
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

// Human-like delay: minimum wait + scaled by response length
function typingDelay(responseLength, startedAt) {
  const minMs = 900;
  const scaledMs = Math.min(responseLength * 14, 2200);
  const targetMs = Math.max(minMs, scaledMs);
  const elapsed = Date.now() - startedAt;
  return Math.max(0, targetMs - elapsed);
}

function renderContent(text) {
  return text.split('\n').map((line, i, arr) => (
    <span key={i}>
      {line}
      {i < arr.length - 1 && <br />}
    </span>
  ));
}

// ─── Component ───────────────────────────────────────────

export default function AbbyWidget() {
  const pathname = usePathname();

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([INITIAL_MESSAGE]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [view, setView] = useState('chat'); // 'chat' | 'contact'
  const [form, setForm] = useState({
    name: '', email: '', phone: '', category: '', message: '', smsConsent: false,
  });
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Determine bubble visibility
  const hideBubble = HIDE_BUBBLE_PATTERNS.some(p => p.test(pathname ?? ''));

  // Expose global trigger so app shell can open Abby without the bubble
  // Usage in app shell: <button onClick={() => window.openAbby?.()}>Help</button>
  useEffect(() => {
    window.openAbby = () => setIsOpen(true);
    return () => { delete window.openAbby; };
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping, isOpen]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && view === 'chat') {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen, view]);

  const handleOpen = () => {
    setIsOpen(true);
    track('abby_opened', { path: pathname });
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const switchView = (next) => {
    setView(next);
    if (next === 'contact') {
      track('abby_contact_opened', { path: pathname });
    }
  };

  // ─── Chat ───────────────────────────────────────────────

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || isTyping) return;

    const sentAt = Date.now();
    const userMsg = { id: sentAt, role: 'user', content: text };
    const next = [...messages, userMsg];

    setMessages(next);
    setInput('');
    setIsTyping(true);

    track('abby_message_sent', {
      snippet: text.slice(0, 60),
      exchange_count: next.filter(m => m.role === 'user').length,
    });

    try {
      // Build API payload — exclude the pre-rendered initial greeting
      const apiMessages = next
        .filter(m => m.id !== 'abby-init')
        .map(m => ({ role: m.role, content: m.content }));

      const res = await fetch('/api/abby/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: apiMessages }),
      });

      const data = await res.json();
      const reply =
        data.reply ??
        "I'm having a bit of trouble right now. Want me to help you reach our team?";

      // Wait for human-like delay
      await sleep(typingDelay(reply.length, sentAt));

      setIsTyping(false);
      setMessages(prev => [
        ...prev,
        { id: Date.now(), role: 'assistant', content: reply },
      ]);
    } catch {
      await sleep(typingDelay(80, sentAt));
      setIsTyping(false);
      setMessages(prev => [
        ...prev,
        {
          id: Date.now(),
          role: 'assistant',
          content:
            "Sorry, I'm having trouble connecting right now. You can reach our team via the contact form or at support@abodecostseg.com.",
        },
      ]);
    }
  }, [input, isTyping, messages]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // ─── Contact Form ────────────────────────────────────────

  const updateForm = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const submitForm = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError('');

    try {
      const res = await fetch('/api/abby/escalate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok || data.error) {
        setFormError(data.error || 'Something went wrong. Please try again.');
        return;
      }

      setFormSubmitted(true);
      track('abby_escalation_submitted', { category: form.category });
    } catch {
      setFormError('Network error. Please email support@abodecostseg.com directly.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── Render ──────────────────────────────────────────────

  return (
    <>
      {/* Floating bubble — hidden on app/checkout routes */}
      {!hideBubble && (
        <button
          className={`abby-bubble${isOpen ? ' abby-bubble--open' : ''}`}
          onClick={isOpen ? handleClose : handleOpen}
          aria-label="Chat with Abby, Abode's AI assistant"
        >
          {isOpen ? (
            <ChevronDown size={20} />
          ) : (
            <>
              <Sparkles size={18} />
              <span className="abby-bubble-label">Ask Abby</span>
            </>
          )}
        </button>
      )}

      {/* Chat window */}
      {isOpen && (
        <div
          className="abby-window"
          role="dialog"
          aria-label="Abby — Abode AI Assistant"
        >
          {/* Header */}
          <div className="abby-header">
            <div className="abby-header-identity">
              <div className="abby-avatar">A</div>
              <div>
                <div className="abby-name">Abby</div>
                <div className="abby-status">Abode AI Assistant</div>
              </div>
            </div>
            <div className="abby-header-actions">
              <button
                className="abby-escalate-trigger"
                onClick={() => switchView(view === 'contact' ? 'chat' : 'contact')}
              >
                {view === 'contact' ? 'Back to Chat' : 'Contact Us'}
              </button>
              <button
                className="abby-close"
                onClick={handleClose}
                aria-label="Close chat"
              >
                <X size={17} />
              </button>
            </div>
          </div>

          {/* ── Contact Form View ── */}
          {view === 'contact' && (
            <div className="abby-escalation">
              {formSubmitted ? (
                <div className="abby-escalation-success">
                  <div className="abby-escalation-success-icon">✓</div>
                  <div className="abby-escalation-success-text">
                    Message sent! Our team will get back to you within 1–2 business days.
                  </div>
                </div>
              ) : (
                <form onSubmit={submitForm} className="abby-escalation-form" noValidate>
                  <div className="abby-escalation-title">Send us a message</div>

                  <input
                    type="text"
                    className="abby-escalation-input"
                    placeholder="Your name *"
                    value={form.name}
                    onChange={e => updateForm('name', e.target.value)}
                    required
                    autoComplete="name"
                  />
                  <input
                    type="email"
                    className="abby-escalation-input"
                    placeholder="Email address *"
                    value={form.email}
                    onChange={e => updateForm('email', e.target.value)}
                    required
                    autoComplete="email"
                  />
                  <input
                    type="tel"
                    className="abby-escalation-input"
                    placeholder="Phone number (optional)"
                    value={form.phone}
                    onChange={e => updateForm('phone', e.target.value)}
                    autoComplete="tel"
                  />

                  {/* SMS consent — only shown if phone is provided */}
                  {form.phone.trim() && (
                    <label className="abby-sms-consent">
                      <input
                        type="checkbox"
                        checked={form.smsConsent}
                        onChange={e => updateForm('smsConsent', e.target.checked)}
                      />
                      <span>
                        I consent to receive SMS messages from Abode regarding my inquiry.
                        Message &amp; data rates may apply. Reply STOP to opt out at any time.
                      </span>
                    </label>
                  )}

                  <select
                    className="abby-escalation-input abby-escalation-select"
                    value={form.category}
                    onChange={e => updateForm('category', e.target.value)}
                  >
                    <option value="">Select a topic</option>
                    {CATEGORIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>

                  <textarea
                    className="abby-escalation-input abby-escalation-textarea"
                    placeholder="Your message *"
                    value={form.message}
                    onChange={e => updateForm('message', e.target.value)}
                    rows={3}
                    required
                  />

                  {formError && (
                    <div className="abby-escalation-error">{formError}</div>
                  )}

                  <div className="abby-escalation-legal">
                    By submitting, you agree to our{' '}
                    <a href="/privacy" target="_blank" rel="noopener noreferrer">
                      Privacy Policy
                    </a>
                    .
                  </div>

                  <button
                    type="submit"
                    className="abby-escalation-submit"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Sending…' : 'Send Message'}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* ── Chat View ── */}
          {view === 'chat' && (
            <>
              <div className="abby-messages" aria-live="polite" aria-atomic="false">
                {messages.map(msg => (
                  <div
                    key={msg.id}
                    className={`abby-message abby-message--${msg.role}`}
                  >
                    {msg.role === 'assistant' && (
                      <div className="abby-message-avatar" aria-hidden="true">A</div>
                    )}
                    <div className="abby-message-bubble">
                      {msg.id === 'abby-init' ? (
                        <>
                          {renderContent(
                            msg.content.replace(
                              'understand the service.',
                              'understand the service.'
                            )
                          )}
                        </>
                      ) : (
                        renderContent(msg.content)
                      )}
                    </div>
                  </div>
                ))}

                {/* Typing indicator */}
                {isTyping && (
                  <div className="abby-message abby-message--assistant">
                    <div className="abby-message-avatar" aria-hidden="true">A</div>
                    <div className="abby-message-bubble abby-typing" aria-label="Abby is typing">
                      <span className="abby-dot" />
                      <span className="abby-dot" />
                      <span className="abby-dot" />
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="abby-input-area">
                <textarea
                  ref={inputRef}
                  className="abby-input"
                  placeholder="Ask me anything about cost seg…"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  rows={1}
                  disabled={isTyping}
                  aria-label="Message Abby"
                />
                <button
                  className="abby-send"
                  onClick={sendMessage}
                  disabled={!input.trim() || isTyping}
                  aria-label="Send message"
                >
                  <Send size={15} />
                </button>
              </div>

              <div className="abby-footer">
                Not tax or legal advice &middot;{' '}
                <a href="/privacy" target="_blank" rel="noopener noreferrer">Privacy</a>
                {' '}&middot;{' '}
                <a href="/disclaimers" target="_blank" rel="noopener noreferrer">Disclaimers</a>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
