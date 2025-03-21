"use client";

import React from 'react';
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";

export default function AuthTroubleshootingPage() {
  return (
    <div className="container max-w-3xl py-10">
      <div className="mb-8">
        <Link href="/auth" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Sign In
        </Link>
        <h1 className="text-3xl font-bold mt-4 mb-2">Authentication Troubleshooting</h1>
        <p className="text-muted-foreground">
          If you're having trouble signing in, this guide can help resolve common issues.
        </p>
      </div>

      <Accordion type="single" collapsible className="mb-8">
        <AccordionItem value="cookies">
          <AccordionTrigger>Browser Cookie Issues</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              <p>
                Google Authentication requires third-party cookies to be enabled in your browser. 
                If these are blocked, the sign-in process will fail.
              </p>
              
              <h3 className="font-semibold">How to enable third-party cookies:</h3>
              
              <div className="space-y-2">
                <h4 className="font-medium">Chrome</h4>
                <ol className="list-decimal pl-5 space-y-1">
                  <li>Click the three dots in the top-right corner</li>
                  <li>Select "Settings"</li>
                  <li>Go to "Privacy and Security"</li>
                  <li>Click "Cookies and other site data"</li>
                  <li>Make sure "Block third-party cookies" is not selected</li>
                </ol>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium">Firefox</h4>
                <ol className="list-decimal pl-5 space-y-1">
                  <li>Click the three lines in the top-right corner</li>
                  <li>Select "Settings"</li>
                  <li>Go to "Privacy & Security"</li>
                  <li>Under "Cookies and Site Data", select "Standard" tracking protection</li>
                </ol>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium">Safari</h4>
                <ol className="list-decimal pl-5 space-y-1">
                  <li>Go to Safari preferences</li>
                  <li>Select "Privacy"</li>
                  <li>Uncheck "Prevent cross-site tracking"</li>
                  <li>Make sure "Block all cookies" is not selected</li>
                </ol>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="incognito">
          <AccordionTrigger>Using Private/Incognito Mode</AccordionTrigger>
          <AccordionContent>
            <p>
              By default, most browsers block third-party cookies in private/incognito mode. 
              Try signing in using a regular browser window instead.
            </p>
            <p className="mt-2">
              If you must use private browsing:
            </p>
            <ul className="list-disc pl-5 mt-2">
              <li>In Chrome incognito, click the "eye" icon in the address bar to allow third-party cookies for this site</li>
              <li>In Firefox private browsing, you may need to disable tracking protection temporarily</li>
            </ul>
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="extensions">
          <AccordionTrigger>Browser Extensions Interference</AccordionTrigger>
          <AccordionContent>
            <p>
              Ad blockers, privacy extensions, and VPNs can interfere with authentication.
              Try temporarily disabling extensions, especially:
            </p>
            <ul className="list-disc pl-5 mt-2">
              <li>AdBlock, AdBlock Plus, uBlock Origin</li>
              <li>Privacy Badger, DuckDuckGo Privacy</li>
              <li>Cookie blockers</li>
              <li>Script blockers like NoScript</li>
            </ul>
            <p className="mt-2">
              After signing in, you can re-enable these extensions.
            </p>
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="different-browser">
          <AccordionTrigger>Try a Different Browser</AccordionTrigger>
          <AccordionContent>
            <p>
              If you continue to experience issues, try using a different browser. 
              Chrome typically works best with Google authentication.
            </p>
            <p className="mt-2">
              Sometimes browser-specific security settings or configurations can cause issues 
              that are difficult to diagnose. Using an alternative browser is often the quickest solution.
            </p>
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="clear-cache">
          <AccordionTrigger>Clear Browser Cache and Cookies</AccordionTrigger>
          <AccordionContent>
            <p>
              Clearing your browser's cache and cookies can resolve persistent authentication issues:
            </p>
            <div className="space-y-2 mt-2">
              <h4 className="font-medium">Chrome</h4>
              <ol className="list-decimal pl-5 space-y-1">
                <li>Press Ctrl+Shift+Delete (Windows/Linux) or Cmd+Shift+Delete (Mac)</li>
                <li>Select "Cookies and other site data" and "Cached images and files"</li>
                <li>Click "Clear data"</li>
              </ol>
            </div>
            <div className="space-y-2 mt-2">
              <h4 className="font-medium">Firefox</h4>
              <ol className="list-decimal pl-5 space-y-1">
                <li>Press Ctrl+Shift+Delete (Windows/Linux) or Cmd+Shift+Delete (Mac)</li>
                <li>Select "Cookies" and "Cache"</li>
                <li>Click "Clear Now"</li>
              </ol>
            </div>
            <div className="space-y-2 mt-2">
              <h4 className="font-medium">Safari</h4>
              <ol className="list-decimal pl-5 space-y-1">
                <li>Go to Safari menu > "Clear History"</li>
                <li>Select the time range and click "Clear History"</li>
              </ol>
            </div>
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="alternative">
          <AccordionTrigger>Alternative Sign-in Methods</AccordionTrigger>
          <AccordionContent>
            <p>
              If you continue to have issues with Google authentication, consider using one of these alternatives:
            </p>
            <ul className="list-disc pl-5 mt-2">
              <li>Sign in using email and password</li>
              <li>Create a new account with your email address</li>
              <li>Use guest mode (note that your data won't be saved between sessions)</li>
            </ul>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      
      <div className="bg-muted p-4 rounded-lg mb-8">
        <h2 className="text-lg font-semibold mb-2">Still Having Issues?</h2>
        <p className="mb-4">
          If you've tried all the troubleshooting steps and still can't sign in, please contact our support team.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline">
            <Link href="/auth">
              Try Signing In Again
            </Link>
          </Button>
          <Button asChild>
            <Link href="/builder?guest=true">
              Continue as Guest
            </Link>
          </Button>
        </div>
      </div>
      
      <div className="text-sm text-muted-foreground">
        <h3 className="font-medium mb-2">Additional Resources</h3>
        <ul className="space-y-2">
          <li>
            <Link 
              href="https://support.google.com/accounts/answer/7675428" 
              target="_blank"
              className="flex items-center hover:text-foreground"
            >
              Google Account Sign-In Troubleshooting
              <ExternalLink className="ml-1 h-3 w-3" />
            </Link>
          </li>
          <li>
            <Link 
              href="https://support.google.com/chrome/answer/95647" 
              target="_blank"
              className="flex items-center hover:text-foreground"
            >
              Manage Cookies in Chrome
              <ExternalLink className="ml-1 h-3 w-3" />
            </Link>
          </li>
          <li>
            <Link 
              href="https://next-auth.js.org/getting-started/client#signin" 
              target="_blank"
              className="flex items-center hover:text-foreground"
            >
              NextAuth.js Documentation
              <ExternalLink className="ml-1 h-3 w-3" />
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
} 