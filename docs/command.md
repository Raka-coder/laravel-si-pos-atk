# Implementation Plan: POS Landing Page (Soft Glassmorphism)

   ## Objective
   Build a modern, approachable landing page for the Laravel POS system using a **Soft Glassmorphism** aesthetic. The page will serve as the new root (`/`) entry point,
   replacing the automatic redirect to the login page. It will feature a striking Hero section with a dashboard mockup and a comprehensive Feature Grid.

   ## Key Files & Context
   - `routes/web.php`: Update the root route to render the Inertia `welcome` view.
   - `resources/js/pages/welcome.tsx`: The new React component serving as the landing page.
   - `resources/css/app.css`: Add custom `@theme` variables or animations for the glassmorphism background effects if needed.

   ## Implementation Steps

   ### 1. Update Routing
   - Modify `routes/web.php` to change `Route::get('/', ...)` so it returns `Inertia::render('welcome', [ ...props ])`.
   - Pass necessary authentication state (e.g., `canLogin`, `canRegister`) so the landing page can display a "Dashboard" button if the user is already logged in, or a
   "Login" button otherwise.

   ### 2. Scaffold the Welcome Page
   - Create `resources/js/pages/welcome.tsx` with a responsive layout.
   - Include a fixed or floating navigation bar with the brand logo and auth links.
   - Set up the base background with a soft, blurred mesh gradient (using absolute positioned overlapping colored circles with high `blur` utilities).

   ### 3. Design the Hero Section (Mockup)
   - **Content**: A compelling headline (e.g., "Smarter Retail, Seamless Payments") and a descriptive subheadline.
   - **CTAs**: A primary solid button ("Get Started") and a secondary glass-style button ("Learn More").
   - **Mockup**: A stylized visual representation of the POS dashboard. It will be contained within a glassmorphism card (`bg-white/60 dark:bg-black/40 backdrop-blur-xl
   border border-white/20`) floating slightly above the background.

   ### 4. Design the Feature Grid
   - **Layout**: A responsive CSS grid (1 column on mobile, 2 on tablet, 3 or 4 on desktop).
   - **Cards**: Each feature will be encapsulated in a glassmorphic card with subtle hover effects (e.g., a slight lift and increased border opacity).
   - **Features to highlight**:
     - 📦 Advanced Inventory Management
     - 📊 Real-time Financial Reports
     - 💳 Midtrans Payment Integration
     - 🤖 AI-Powered Chatbot Assistant
   - **Visuals**: Use `lucide-react` icons with soft gradient colors to match the aesthetic.

   ### 5. Final Polish & Aesthetics
   - **Animations**: Implement subtle entrance animations (fade-in, slide-up) for the hero and feature cards using Tailwind utilities or custom CSS keyframes.
   - **Dark Mode**: Ensure the glassmorphism looks stunning in dark mode by adjusting background blob colors and surface opacities.
   - **Accessibility**: Verify contrast ratios, ensuring text remains readable against the blurred backgrounds.

   ## Verification & Testing
   - Start the development server and navigate to `/`.
   - Verify the glassmorphism effect performs smoothly and degrades gracefully on older browsers.
   - Test responsiveness across mobile, tablet, and desktop viewports.
   - Confirm the authentication links accurately route to the login/dashboard pages.
   - Ensure no existing tests are broken by the route change (update tests if they expect a 302 redirect on `/`).