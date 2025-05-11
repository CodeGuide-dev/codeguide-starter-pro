import { NextResponse } from "next/server";
import { createClerkSupabaseClientSsr } from "@/utils/supabase/server";
import { SiteStatus } from "@/types/sites";

// This route returns the JavaScript code that will be embedded on the client's website
export async function GET(
  req: Request,
  { params }: { params: { siteId: string } }
) {
  try {
    const { siteId } = params;
    
    // No auth check here as this is a public endpoint
    const supabase = await createClerkSupabaseClientSsr();
    
    // Get the site to verify it exists and is verified
    const { data: site, error } = await supabase
      .from("sites")
      .select("status, domain")
      .eq("id", siteId)
      .single();
    
    if (error || !site) {
      console.error("Error fetching site for embed:", error);
      return new NextResponse("console.error('Social Proof: Invalid site ID');", {
        status: 404,
        headers: {
          "Content-Type": "application/javascript",
          "Cache-Control": "public, max-age=300",
        },
      });
    }
    
    // If site is not verified, don't provide the real code
    if (site.status !== SiteStatus.VERIFIED) {
      return new NextResponse("console.error('Social Proof: Site not verified');", {
        status: 200,
        headers: {
          "Content-Type": "application/javascript",
          "Cache-Control": "public, max-age=300",
        },
      });
    }
    
    // Generate the embed code with proper CSP and security measures
    const embedCode = `
(function() {
  // Configuration
  var config = {
    siteId: "${siteId}",
    apiEndpoint: "${process.env.NEXT_PUBLIC_VERCEL_URL || 'localhost:3000'}/api",
    targetOrigin: "https://${site.domain}"
  };
  
  // Notification container
  var container = document.createElement('div');
  container.id = 'social-proof-container';
  container.style.cssText = 'position:fixed;bottom:20px;left:20px;z-index:9999;';
  document.body.appendChild(container);
  
  // Initialize the client
  window.SocialProof = window.SocialProof || {};
  window.SocialProof.init = function(options) {
    console.log('Social Proof initialized with options:', options);
    
    // Start fetching notifications
    fetchNotifications();
  };
  
  // Fetch notifications from the API
  function fetchNotifications() {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', config.apiEndpoint + '/notifications?siteId=' + config.siteId);
    xhr.onload = function() {
      if (xhr.status === 200) {
        var response = JSON.parse(xhr.responseText);
        if (response.notifications && response.notifications.length > 0) {
          showNotification(response.notifications[0]);
        }
      }
    };
    xhr.send();
  }
  
  // Display a notification
  function showNotification(notification) {
    var notifEl = document.createElement('div');
    notifEl.className = 'social-proof-notification';
    notifEl.style.cssText = 'background-color:#fff;border-radius:8px;box-shadow:0 4px 12px rgba(0,0,0,0.15);padding:15px;margin-bottom:10px;max-width:300px;animation:fadeIn 0.5s;';
    notifEl.innerHTML = notification.content || 'Someone just purchased this item!';
    
    container.appendChild(notifEl);
    
    // Animate in
    notifEl.style.animation = 'fadeIn 0.5s';
    
    // Remove after delay
    setTimeout(function() {
      notifEl.style.animation = 'fadeOut 0.5s';
      setTimeout(function() {
        if (container.contains(notifEl)) {
          container.removeChild(notifEl);
        }
      }, 500);
    }, 5000);
    
    // Send impression event
    sendEvent('impression', { notification_id: notification.id });
  }
  
  // Send events back to our API
  function sendEvent(eventType, data) {
    var xhr = new XMLHttpRequest();
    xhr.open('POST', config.apiEndpoint + '/events');
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify({
      site_id: config.siteId,
      event_type: eventType,
      data: data,
      url: window.location.href,
      timestamp: new Date().toISOString()
    }));
  }
  
  // Add necessary styles
  var styleSheet = document.createElement('style');
  styleSheet.textContent = \`
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes fadeOut {
      from { opacity: 1; transform: translateY(0); }
      to { opacity: 0; transform: translateY(20px); }
    }
  \`;
  document.head.appendChild(styleSheet);
})();
    `;
    
    // Return the JavaScript with appropriate headers
    return new NextResponse(embedCode, {
      status: 200,
      headers: {
        "Content-Type": "application/javascript",
        "Cache-Control": "public, max-age=3600",
        "Cross-Origin-Resource-Policy": "cross-origin",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    console.error("Error generating embed code:", error);
    return new NextResponse("console.error('Social Proof: Server error');", {
      status: 500,
      headers: {
        "Content-Type": "application/javascript",
        "Cache-Control": "no-cache",
      },
    });
  }
} 