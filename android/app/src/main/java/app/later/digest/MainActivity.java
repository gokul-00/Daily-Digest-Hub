package app.later.digest;

import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.webkit.WebView;

import com.getcapacitor.BridgeActivity;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class MainActivity extends BridgeActivity {
    private static final String PROD_ORIGIN = "https://daily-digest-hub-three.vercel.app";
    private static final Pattern URL_PATTERN = Pattern.compile("(?i)https?://\\S+");

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        handleIncomingIntent(getIntent());
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        setIntent(intent);
        handleIncomingIntent(intent);
    }

    private void handleIncomingIntent(Intent intent) {
        if (intent == null) {
            return;
        }

        String action = intent.getAction();
        String type = intent.getType();

        if (Intent.ACTION_SEND.equals(action) && type != null && type.startsWith("text/")) {
            String sharedText = intent.getStringExtra(Intent.EXTRA_TEXT);
            String sharedTitle = intent.getStringExtra(Intent.EXTRA_SUBJECT);
            loadWhenReady(buildShareUrl(sharedTitle, sharedText));
        }
    }

    private String buildShareUrl(String title, String text) {
        Uri.Builder builder = Uri.parse(PROD_ORIGIN + "/share").buildUpon();

        if (title != null && !title.trim().isEmpty()) {
            builder.appendQueryParameter("title", title.trim());
        }

        if (text != null && !text.trim().isEmpty()) {
            String trimmed = text.trim();
            if (trimmed.matches("(?i)^https?://\\S+$")) {
                builder.appendQueryParameter("url", trimmed);
            } else {
                Matcher matcher = URL_PATTERN.matcher(trimmed);
                if (matcher.find()) {
                    String found = matcher.group();
                    builder.appendQueryParameter("url", found);
                    String remainder = trimmed.replace(found, "").trim();
                    if (!remainder.isEmpty()) {
                        builder.appendQueryParameter("text", remainder);
                    }
                } else {
                    builder.appendQueryParameter("text", trimmed);
                }
            }
        }

        return builder.build().toString();
    }

    private void loadWhenReady(String url) {
        if (getBridge() != null && getBridge().getWebView() != null) {
            WebView webView = getBridge().getWebView();
            webView.post(() -> webView.loadUrl(url));
            return;
        }

        getWindow().getDecorView().postDelayed(() -> {
            if (getBridge() != null && getBridge().getWebView() != null) {
                getBridge().getWebView().loadUrl(url);
            }
        }, 500);
    }
}
