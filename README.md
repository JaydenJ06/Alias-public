🗣️ Alias

Developed by Jayden Jang & Partner for COMP 426: Modern Web Programming

TypeScript Next.js Tailwind Supabase Docker Vercel

💬 Overview

Alias is a real-time chatting app inspired by Discord, designed to provide seamless, live communication between users within servers and channels.
Users can send messages, share images, react to posts, and see changes instantly across all connected clients — powered by Supabase’s Realtime features.

🧩 Features
🔄 Real-Time Messaging

Users can send messages and images that instantly appear across all clients without needing to refresh.

🧍 Presence Tracking

Shows who’s currently online and active in each server or channel in real-time.

💬 Reactions

Users can add emoji reactions to messages, synced immediately for everyone in the same channel.

📸 Image Uploads

Supports image uploads through Supabase Storage, allowing inline display of shared pictures.

🧑‍💻 Authentication

Uses Supabase Auth for secure sign-up and login.
Each user has a unique profile with username, display name, and avatar.

🪄 Server and Channel System

Users can create or join servers, organize multiple channels, and chat freely within them — all updates happen in real-time.

⚙️ Technical Architecture

Frontend: Next.js + TypeScript + Tailwind CSS
UI Components: Shadcn/ui
Backend: Supabase (Auth, Database, Storage, Realtime)
Realtime Features: Broadcast, Presence, and Postgres Changes
Development Environment: Docker DevContainer (for version consistency)
Deployment: Vercel (connected via GitHub)

The app architecture leverages Supabase’s websocket connections to deliver synchronized messaging, presence updates, and notifications across multiple clients.

🧠 My Contribution

Implemented real-time synchronization for chat messages, reactions, and presence using Supabase’s Realtime API.

Configured Supabase backend — including database migrations, triggers, and authentication setup.

Deployed the app through Vercel, integrating environment variables for secure Supabase connectivity.

Collaborated with my partner through GitHub Classroom, managing code reviews and merges efficiently.
