# Automated Salesforce Developer Catalyst - V3.0 🚀

[![Salesforce](https://img.shields.io/badge/Salesforce-Developer%20Catalyst%20V3.0-00A1E0?style=for-the-badge&logo=salesforce&logoColor=white)](https://trailhead.salesforce.com/users/trjha3/trailmixes/salesforce-developer-catalyst-v-3-0)
[![Badges](https://img.shields.io/badge/Trailmix%20Badges-32%2F32%20(100%25)-success?style=for-the-badge&logo=trailhead&logoColor=white)](https://trailhead.salesforce.com/users/trjha3/trailmixes/salesforce-developer-catalyst-v-3-0)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

An end-to-end automated orchestration toolkit and full metadata repository designed to help developers and students seamlessly complete all **32 Badges (Modules & Projects)** of the **[Salesforce Developer Catalyst - V3.0](https://trailhead.salesforce.com/users/trjha3/trailmixes/salesforce-developer-catalyst-v-3-0)** Trailmix.

---

## ✨ Features

- 🎯 **Turnkey Master Runner (`npm start`)**: Interactive CLI that automatically audits your progress, deploys required project metadata, and solves challenges.
- ⚡ **Auto-Detection of Hands-on Org**: Dynamically discovers your active Trailhead Playground / Developer Edition org without hardcoding org IDs or usernames.
- 🧩 **Complete Pre-configured Metadata (`force-app/`)**: Full source-tracked metadata for all hands-on projects, including custom objects, relationship fields, screen flows, validation rules, Apex triggers, permission sets, and layouts.
- 🧠 **Instant Quiz Solver**: Built-in verification engine with exact answer keys for all 32 knowledge checks and multiple-choice quizzes.
- 🛡️ **Rate-Limit & Anti-Detection Protected**: Built with exponential backoff and stealth evasion to respect Trailhead backend rate limits and prevent Google auth blocks.

---

## 📋 Prerequisites

Before getting started, make sure you have the following installed on your system:

1. **[Node.js](https://nodejs.org/)** (v18.0.0 or later)
2. **[Git](https://git-scm.com/)**
3. **[Salesforce CLI (`sf`)](https://developer.salesforce.com/tools/salesforcecli)**
   ```bash
   sf --version
   ```
4. **Google Chrome** installed (used for one-time interactive login)

---

## 🚀 Quickstart Guide

### Step 1: Clone the Repository
```bash
git clone https://github.com/yash-shende99/Automated-Salesforce-Developer-Catalyst--V3.0.git
cd Automated-Salesforce-Developer-Catalyst--V3.0
npm install
```

### Step 2: Authenticate to Trailhead
Run the anti-detection auth helper to capture your active Trailhead session:
```bash
npm run auth
```
- A clean Chrome window will open.
- Log in to your Trailhead / Google account normally.
- Once logged in, the window closes automatically, saving your local session safely (excluded from Git).

### Step 3: Run the Catalyst Orchestrator
```bash
npm start
```
From the interactive menu:
- Select **`1`** to Audit your live Trailmix progress.
- Select **`2`** to automatically deploy metadata and complete all pending badges!

---

## 🏆 Covered Modules & Projects (32 of 32)

| # | Title | Type | Status |
|:---:|:---|:---:|:---:|
| 1 | **Your Guide to Trailhead** | Module | Verified |
| 2 | **Agentforce 360 Platform Basics** | Module | Verified |
| 3 | **Lightning Experience Customization** | Module | Verified |
| 4 | **Data Modeling** | Module | Verified |
| 5 | **Picklist Administration** | Module | Verified |
| 6 | **Duplicate Management** | Module | Verified |
| 7 | **Customize a Salesforce Object** | Project | Verified |
| 8 | **Formulas and Validations** | Module | Verified |
| 9 | **Improve Data Quality for a Recruiting App** | Project | Verified |
| 10 | **Customize the User Interface for a Recruiting App** | Project | Verified |
| 11 | **Flow Builder Basics** | Module | Verified |
| 12 | **Create a Screen Flow That Checks for Duplicates** | Project | Verified |
| 13 | **Screen Flows** | Module | Verified |
| 14 | **Lightning App Builder** | Module | Verified |
| 15 | **Approve Records with Approval Processes** | Module | Verified |
| 16 | **Automate Business Processes for a Recruiting App** | Project | Verified |
| 17 | **Build a Discount Approval Process** | Project | Verified |
| 18 | **Quick Start: Lightning App Builder** | Project | Verified |
| 19 | **Data Management** | Module | Verified |
| 20 | **Event Monitoring** | Module | Verified |
| 21 | **Data Security** | Module | Verified |
| 22 | **Keep Data Secure in a Recruiting App** | Project | Verified |
| 23 | **Shield Platform Encryption** | Module | Verified |
| 24 | **API Basics** | Module | Verified |
| 25 | **360 Platform API Basics** | Module | Verified |
| 26 | **Apex Basics for Admins** | Module | Verified |
| 27 | **SOQL for Admins** | Module | Verified |
| 28 | **Apex Triggers** | Module | Verified |
| 29 | **Apex Testing** | Module | Verified |
| 30 | **Asynchronous Apex** | Module | Verified |
| 31 | **Apex Integration Services** | Module | Verified |
| 32 | **Leads and Opportunities** | Module | Verified |

---

## 🛠️ Known Gotchas & Troubleshooting Guide

### 1. *Customize a Salesforce Object* (Unit 1): "We couldn't find a field called Prospect Rating"
- **Cause**: Standard field `Rating` on `Account` must be renamed to `Prospect Rating` using the Setup UI.
- **Fix**: In your org, go to **Setup $\rightarrow$ Rename Tabs and Labels $\rightarrow$ Edit next to Accounts $\rightarrow$ Step 2 (Standard Fields)**, find `Rating` and rename it to `Prospect Rating`, then click **Save**.

### 2. *Keep Data Secure in a Recruiting App* (Step 2): Interviewer OWD
- **Cause**: In some playgrounds, `Position__c` on `Interviewer__c` is created as a `MasterDetail` relationship, which locks `Interviewer__c` into `ControlledByParent`. The challenge requires `Interviewer` to be `Private`.
- **Fix**: The repository automatically provides `Position__c` as a `Lookup` field with `SetNull` constraint, allowing both Default Internal Access and Default External Access to be saved as `Private`.

### 3. Rate Limiting Buffer
- Trailhead enforces backend assessment throttling. The runner incorporates built-in 6-to-8 second delays between verification calls to avoid HTTP 429/403 blocks.

---

## 🔒 Security & Privacy Notice

This repository follows strict security practices:
- **No credentials or access tokens are committed**: Personal authentication tokens (`trailhead_auth.json`, `.session.json`, `.env`) are explicitly ignored via `.gitignore`.
- Every user runs with their own isolated local credentials and Salesforce Playground.

---

## 📜 License
Distributed under the MIT License. See `LICENSE` for more information.