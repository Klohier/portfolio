---
layout: ../../layouts/ProjectLayout.astro
title: DnBoxes
author: Keiji Lohier
description: "Realtime Multiplayer Platform for playing Dots and Boxes"
image:
  url: "/gameplay.jpeg"
  alt: "Gameplay image of Dots and Boxes."
pubDate: 2026-01-20
tags: ["DnBoxes", "React", "Typescript", "Golang"]
---

# DnBoxes (Dots and Boxes)

A real-time multiplayer platform for playing Dots and Boxes, featuring WebSocket-based gameplay, comprehensive lobby system, and live chat. Built as a learning project to explore distributed systems architecture, event sourcing patterns, and production deployment strategies.

## Overview

I created this project to practice implementing a distributed system with real-time communication while having something fun and testable to share with friends and family. What started as a simple game implementation evolved into a sophisticated platform showcasing modern backend architecture and full-stack development practices.

## Tech Stack

**Backend**

- Go with Echo framework
- PostgreSQL for persistence
- Redis as event bus for real-time updates
- WebSocket protocol for bidirectional communication
- Domain Driven Design

**Frontend**

- React with TypeScript
- Real-time UI updates via WebSocket
- Tanstack Query
- Zod Validation
- React Form
- Sonner

**Infrastructure**

- Docker containerization
- Caddy reverse proxy
- VPS

## Key Features

### Real-Time Multiplayer

- WebSocket-based game state synchronization
- Lobby system
- In game chat functionality
- Play against other players or a basic bot opponent

### Architecture Highlights

- Event Bus
- Proper separation of concerns using DDD principles
- Auth system
- Dependecy Injection

## Development Journey

This project went through significant architectural evolution. I started with a simple service oriented archeticutre approach and refactored to a proper Domain-Driven Design architecture with an event bus, which provided valuable experience with:

- Implementing event-driven communication patterns
- Managing WebSocket connections and connection lifecycle
- Building responsive real-time UI with complex state management

The most challenging aspects were trying to figure out the boundaries between packages. For example I was struggling figuring out how to seperate my websocket from being coupled with everything else in the system.

## What I Learned

### Docker Containerization with Docker Compose Deployment

Containerized the application using Docker with Docker Compose orchestration. This eliminated environment-specific issues and made the project immediately runnable on any machine—whether my local development setup, a staging server, or production infrastructure. Deployment became as simple as cloning the repo and running docker-compose up

### Importance of Seperation of Concerns

I structured the codebase around single responsibility principles, ensuring each service and function served one clear purpose. This architectural decision proved invaluable during refactoring. Changes to individual components remained isolated, allowing me to evolve the system confidently without cascading side effects.

## Future Enhancements

I plan on adding a smarter bot that would use the minimax algorithim with alpha beta pruning rather than if conditionals.

## Links

- [GitHub Repository](https://github.com/Klohier/DnBoxes)
- [Live Link](https://dotsandboxesonline.com/)
