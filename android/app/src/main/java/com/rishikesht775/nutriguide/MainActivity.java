package com.rishikesht775.nutriguide;

import android.app.Activity;
import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.graphics.Color;
import android.net.Uri;
import android.os.Bundle;
import android.view.Gravity;
import android.view.View;
import android.view.WindowInsets;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.ScrollView;
import android.widget.TextView;
import androidx.browser.customtabs.CustomTabColorSchemeParams;
import androidx.browser.customtabs.CustomTabsIntent;

/** Browser-backed Android entry point; credentials stay in the browser. */
public final class MainActivity extends Activity {
    private static final String SITE_URL = "https://nutriguide-calorie-planner.rishikesht775.chatgpt.site/legacy";
    private TextView status;

    @Override public void onCreate(Bundle state) {
        super.onCreate(state);
        LinearLayout content = new LinearLayout(this);
        content.setOrientation(LinearLayout.VERTICAL);
        content.setGravity(Gravity.CENTER_VERTICAL);
        content.setPadding(dp(28), dp(36), dp(28), dp(36));
        content.setBackgroundColor(Color.rgb(243, 249, 244));
        TextView brand = text("NUTRIGUIDE", 34, Color.rgb(20, 125, 104));
        brand.setTypeface(null, android.graphics.Typeface.BOLD);
        content.addView(brand);
        content.addView(text(getString(R.string.app_tagline), 24, Color.rgb(24, 63, 56)));
        content.addView(text(getString(R.string.browser_notice), 16, Color.rgb(72, 102, 93)));
        Button open = new Button(this);
        open.setText(R.string.open_nutriguide);
        open.setAllCaps(false);
        open.setTextColor(Color.WHITE);
        open.setBackgroundTintList(android.content.res.ColorStateList.valueOf(Color.rgb(20, 125, 104)));
        open.setOnClickListener(view -> openSite());
        content.addView(open, new LinearLayout.LayoutParams(-1, dp(60)));
        status = text(getString(R.string.return_notice), 14, Color.rgb(72, 102, 93));
        status.setAccessibilityLiveRegion(View.ACCESSIBILITY_LIVE_REGION_POLITE);
        content.addView(status);
        ScrollView scroll = new ScrollView(this);
        scroll.setFillViewport(true);
        scroll.addView(content);
        scroll.setOnApplyWindowInsetsListener((view, insets) -> {
            if (android.os.Build.VERSION.SDK_INT >= 30) {
                android.graphics.Insets bars = insets.getInsets(WindowInsets.Type.systemBars() | WindowInsets.Type.displayCutout());
                view.setPadding(bars.left, bars.top, bars.right, bars.bottom);
            } else {
                view.setPadding(insets.getSystemWindowInsetLeft(), insets.getSystemWindowInsetTop(), insets.getSystemWindowInsetRight(), insets.getSystemWindowInsetBottom());
            }
            return insets;
        });
        setContentView(scroll);
        if (state == null) openSite();
    }

    private void openSite() {
        Uri uri = Uri.parse(SITE_URL);
        CustomTabColorSchemeParams colors = new CustomTabColorSchemeParams.Builder()
            .setToolbarColor(Color.rgb(20, 125, 104)).build();
        CustomTabsIntent tab = new CustomTabsIntent.Builder()
            .setDefaultColorSchemeParams(colors).setShowTitle(true).build();
        try {
            tab.launchUrl(this, uri);
            status.setText(R.string.return_notice);
        } catch (ActivityNotFoundException noCustomTab) {
            try {
                startActivity(new Intent(Intent.ACTION_VIEW, uri));
            } catch (ActivityNotFoundException noBrowser) {
                status.setText(R.string.no_browser);
            }
        }
    }

    private TextView text(String value, int size, int color) {
        TextView view = new TextView(this);
        view.setText(value);
        view.setTextSize(size);
        view.setTextColor(color);
        view.setPadding(0, 0, 0, dp(20));
        return view;
    }
    private int dp(int value) { return Math.round(value * getResources().getDisplayMetrics().density); }
}
