---
layout: ../../layouts/ProjectLayout.astro
title: Commander Roulette
author: Keiji Lohier
description: "A Tinder-style interface for discovering Magic: The Gathering commanders"
image:
  url: "/roulette.jpeg"
  alt: "Commander Roulette card interface."
pubDate: 2026-01-31
tags: ["Commander Roulette", "React", "Typescript", "Scryfall API"]
---

# Commander Roulette

A simple Tinder-style interface for discovering Magic: The Gathering commanders. Click yes to save commanders you like, click no to see the next one, and view your saved collection in a separate tab.

## Overview

I created this project to make finding commanders for new EDH decks less overwhelming. Instead of scrolling through endless lists, you're presented with one card at a time and make a quick decision. You can than look at this list later to help you figure out what commander you want to build out next

## Tech Stack

**Frontend**

- React with TypeScript
- Scryfall API for card data
- Local storage for saved commanders

## Key Features

### Card-by-Card Discovery

- Simple yes/no buttons to make quick decisions
- One commander displayed at a time
- Automatic progression to next card
- Card images from Scryfall

### Saved Collection

- Separate tab to view all saved commanders
- Remove cards from your collection
- Persistent storage across sessions

## Development Journey

This was a focused project to practice working with external APIs and managing simple state. The main challenges were:

- **API Integration**: Learning to work with Scryfall's REST API and understanding their data structure
- **State Management**: Keeping track of seen cards and saved commanders
- **Local Storage**: Persisting the collection without a backend

## What I Learned

### Working with External APIs

This was my first time integrating a comprehensive third-party API. I learned how to read API documentation, handle JSON responses, and structure my code to work with external data sources.

### Simple State Management

Managing which cards have been seen and which are saved taught me practical state management patterns without over-engineering. Local storage provided a straightforward way to persist data without needing a backend.

## Future Enhancements

- Add basic filtering options (color identity, card text)
- Implement undo for accidental clicks
- Add ability to export saved commanders as a list

## Links

- [GitHub Repository](https://github.com/Klohier/Commander-Roulette)
- [Live Link](https://bucolic-taiyaki-056ce7.netlify.app/)
