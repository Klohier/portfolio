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
- Toaster

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

This allowed me to quickly get up and running working on this project from whatever environment I found myself in. This also made it very easy to deploy my project on other serveres.

### Importance of Seperation of Concerns

Since I took the time to make sure service and function did one thing only, it made it easier to refactor my project as I knew changing one thing would not effect another part of the system. The project being decoupled was highly effective.

## Future Enhancements

I plan on adding a smarter bot that would use the minimax algorithim with alpha beta pruning rather than if conditionals.

## Links

- [GitHub Repository](https://github.com/Klohier/DnBoxes)
