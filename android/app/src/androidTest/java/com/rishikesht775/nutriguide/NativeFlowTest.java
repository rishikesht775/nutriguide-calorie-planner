package com.rishikesht775.nutriguide;
import android.view.View;
import android.view.ViewGroup;
import androidx.test.core.app.ActivityScenario;
import androidx.test.ext.junit.runners.AndroidJUnit4;
import org.junit.Test;
import org.junit.runner.RunWith;
import static androidx.test.espresso.Espresso.*;
import static androidx.test.espresso.action.ViewActions.*;
import static androidx.test.espresso.assertion.ViewAssertions.*;
import static androidx.test.espresso.matcher.ViewMatchers.*;
import static androidx.test.espresso.matcher.RootMatchers.*;
import static org.hamcrest.Matchers.*;
import static org.junit.Assert.*;

@RunWith(AndroidJUnit4.class)
public class NativeFlowTest {
    private void assertNative(View view){assertFalse(view.getClass().getName().contains("WebView"));if(view instanceof ViewGroup){ViewGroup g=(ViewGroup)view;for(int i=0;i<g.getChildCount();i++)assertNative(g.getChildAt(i));}}
    @Test public void nativeProfileFoodAndTabsPersistWithoutBrowser() {
        try(ActivityScenario<MainActivity> scenario=ActivityScenario.launch(MainActivity.class)){
            scenario.onActivity(a->assertNative(a.getWindow().getDecorView()));
            onView(withText("Set up profile")).perform(scrollTo(),click());
            onView(withHint("Age")).perform(replaceText("30"));
            onView(withHint("Height (cm)")).perform(replaceText("168"));
            onView(withHint("Weight (kg)")).perform(replaceText("84"),androidx.test.espresso.action.ViewActions.closeSoftKeyboard());
            onView(withText("Save profile")).perform(scrollTo(),click());
            onView(withText(containsString("1950 kcal"))).check(matches(isDisplayed()));
            onView(withText("Food")).perform(click());
            onView(withHint("Search Indian foods")).perform(typeText("Paneer"));
            onData(is("Paneer")).inRoot(isPlatformPopup()).perform(click());
            androidx.test.espresso.Espresso.closeSoftKeyboard();
            onView(withText("Log food")).perform(scrollTo(),click());
            onView(withText("Paneer · 100.0 g")).perform(scrollTo()).check(matches(isDisplayed()));
            onView(withText("Home")).perform(click());
            onView(withText(containsString("1685 kcal"))).check(matches(isDisplayed()));
            scenario.recreate();
            onView(withText(containsString("1685 kcal"))).check(matches(isDisplayed()));
            onView(withText("Journey")).perform(click());
            onView(withHint("Sleep hours")).check(matches(isDisplayed()));
            onView(withText("Reports")).perform(click());
            onView(withText("This week")).check(matches(isDisplayed()));
        }
    }
}
