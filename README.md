# MernFullStack_Project2
# ***Blogging Platform***
# Overview
* The Blogging Platform is a full-stack web application that allows users to create, edit, share, and interact with blog posts.
* The goal of this project is to provide a simple and intuitive interface for writers, along with an interactive experience for readers through comments, likes, and tags.
* The platform supports user authentication, post management, and role-based access (Admin/User).

# Core Objectives
1. Create an easy-to-use platform for bloggers and readers.
2. Enable authenticated users to manage their own posts.
3. Provide admin-level moderation.
4. Support rich-text authoring and media uploads.
5. This project is structured to demonstrate clean architecture, REST API design, and modern frontend styling.

# Tech Stack
# Backend
1. Node.js + Express
2. MongoDB (Mongoose ORM)
3. JWT Authentication
4. RESTful API

# Frontend 
1. React / Next.js 
2. Axios for HTTP requests
3. TailwindCSS / Bootstrap styling

# Tools
1. Postman API testing
2. Multer (for file uploads)
3. bcrypt (password hashing)

# Features
# Authentication & Authorization
1. User registration and login
2. Secure passwords (bcrypt hash)
3. JWT token-based session
4. Role-based access:
  * User → Can create and manage own posts
  * Admin → Can view/edit/delete all posts

# Blogging System
1. Create rich-text posts
2. Add cover image or attachments
3. Edit/delete own posts
4. Draft or publish modes

# Search & Tagging
1. Search posts by title
2. Filter by author or tags
3. Category-based grouping

# Interactions
1. per post
2. Like / dislike system
3. View count for analytics

# Media Handling
1. Image uploads with Multer
2. Static file hosting

#  Installation & Setup
# backend
cd backend

node server.js

# frontend
cd frontend

npm install

npm start

