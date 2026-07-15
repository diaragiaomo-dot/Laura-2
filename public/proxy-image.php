<?php
/**
 * PHP Server-side Image Proxy for Altervista / PHP static hosting
 * Bypasses Wikipedia Hotlinking blocks and Rate-limiting (429) using CDN routing
 */

// Allow cross-origin requests if needed
header("Access-Control-Allow-Origin: *");

$imageUrl = isset($_GET['url']) ? $_GET['url'] : '';
if (empty($imageUrl)) {
    header("HTTP/1.1 400 Bad Request");
    echo "Missing image URL";
    exit;
}

$targetUrl = trim(urldecode($imageUrl));

// Handle known broken/deleted Wikipedia URLs
if (strpos($targetUrl, "Laura_Pausini_2018.jpg") !== false) {
    $targetUrl = "https://upload.wikimedia.org/wikipedia/commons/a/af/Laura_Pausini_Inedito_World_Tour.jpg";
} else if (strpos($targetUrl, "Laura_Pausini_live_2018.jpg") !== false) {
    $targetUrl = "https://upload.wikimedia.org/wikipedia/commons/a/af/Laura_Pausini_Inedito_World_Tour.jpg";
} else if (strpos($targetUrl, "Laura_Pausini_Sanremo_2022.jpg") !== false) {
    $targetUrl = "https://upload.wikimedia.org/wikipedia/commons/6/6c/Laura_Pausini_viveme.jpg";
}

// Route upload.wikimedia.org through WordPress Photon CDN to prevent 429 Too Many Requests
if (strpos($targetUrl, "upload.wikimedia.org") !== false) {
    $cleanTarget = preg_replace('/^https?:\/\//i', '', $targetUrl);
    $targetUrl = "https://i0.wp.com/" . $cleanTarget;
}

// Fallback high-quality placeholder
$fallbackUrl = "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500";

// Helper to fetch image data with User-Agent headers
function fetch_image($url) {
    $userAgent = "LauraPausiniFanSite/1.0 (contact: diaragiacomo24@gmail.com) PHP/fetch";
    
    // Attempt with cURL (highly recommended on Altervista)
    if (function_exists('curl_init')) {
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
        curl_setopt($ch, CURLOPT_USERAGENT, $userAgent);
        curl_setopt($ch, CURLOPT_TIMEOUT, 15);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false); // For compatibility on older servers
        
        $data = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $contentType = curl_getinfo($ch, CURLINFO_CONTENT_TYPE);
        curl_close($ch);
        
        if ($httpCode === 200 && !empty($data)) {
            return array('data' => $data, 'content_type' => $contentType);
        }
    }
    
    // Fallback to file_get_contents with stream context
    if (ini_get('allow_url_fopen')) {
        $options = array(
            'http' => array(
                'header' => "User-Agent: " . $userAgent . "\r\nAccept: image/*, */*\r\n",
                'timeout' => 15,
                'follow_location' => true
            ),
            'ssl' => array(
                'verify_peer' => false,
                'verify_peer_name' => false
            )
        );
        $context = stream_context_create($options);
        $data = @file_get_contents($url, false, $context);
        
        if ($data !== false) {
            // Try to detect content-type from headers
            $contentType = 'image/jpeg';
            if (isset($http_response_header)) {
                foreach ($http_response_header as $header) {
                    if (preg_match('/^Content-Type:\s*(.*)$/i', $header, $matches)) {
                        $contentType = trim($matches[1]);
                        break;
                    }
                }
            }
            return array('data' => $data, 'content_type' => $contentType);
        }
    }
    
    return null;
}

$image = fetch_image($targetUrl);

if (!$image) {
    // Redirect to Unsplash fallback if the fetch failed
    header("Location: " . $fallbackUrl);
    exit;
}

// Send correct header
if (!empty($image['content_type'])) {
    header("Content-Type: " . $image['content_type']);
} else {
    header("Content-Type: image/jpeg");
}

// Optimize caching for browser speed and to minimize Altervista server load
header("Cache-Control: public, max-age=86400");
echo $image['data'];
exit;
