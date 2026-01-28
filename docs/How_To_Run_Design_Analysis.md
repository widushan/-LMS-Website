# How to Run Design Evaluation Analysis

## Quick Start

### Option 1: Run the Analysis Script (Recommended)

**IMPORTANT**: Always run from the **project root directory** (`e:\LMS\-LMS-Website\`)

```bash
# From project root directory
cd e:\LMS\-LMS-Website
node scripts/analyze-design.js
```

Or on Windows (double-click or run from project root):
```bash
# From project root
analyze-design.bat

# OR
scripts\analyze-design.bat
```

**Note**: If you're in the `scripts` folder, go back to project root first:
```bash
cd ..
node scripts/analyze-design.js
```

### Option 2: Use PowerShell

```powershell
cd e:\LMS\-LMS-Website
node scripts/analyze-design.js
```

## What You'll Get

### 1. Console Output
The script prints a comprehensive report showing:
- 📊 File Metrics (total files, lines of code, largest files)
- 📈 Complexity Analysis (high/medium/low complexity files)
- 🔗 Coupling Analysis (external dependencies, direct imports)
- 🧩 Cohesion Analysis (files with mixed concerns)
- 🎮 Controller Analysis
- ⚛️ Component Analysis
- 📦 Dependency Analysis
- 💡 Recommendations
- 📋 SOLID/GRASP Summary

### 2. JSON Report
A detailed JSON file is saved to: `design-analysis-report.json`

You can:
- Open it in any text editor
- Use it for further analysis
- Include metrics in your report

## Example Output

```
📊 FILE METRICS
Total Files Analyzed: 44
Total Lines of Code: 3,422
Average File Size: 78 lines

🔗 COUPLING ANALYSIS
External Service Dependencies:
  - Clerk: 9 files
  - MongoDB: 5 files
  - Stripe: 3 files
  - Cloudinary: 3 files

Direct Model Imports (High Coupling Indicator):
  - controllers/userController.js: 4 direct model imports
  - controllers/educatorController.js: 3 direct model imports

🧩 COHESION ANALYSIS
Files with Mixed Concerns (Low Cohesion):
  - context/AppContext.jsx: State + API calls + Calculations
  - pages/student/Player.jsx: State + API calls + Calculations

📋 SOLID/GRASP SUMMARY
Single Responsibility Principle (SRP):
  - Files with mixed concerns: 13
  - Recommendation: Split mixed-concern files

Dependency Inversion Principle (DIP):
  - Direct external service dependencies: 20 files
  - Recommendation: Introduce abstraction layers
```

## Using Results in Your Report

### Step 1: Run the Script
```bash
node scripts/analyze-design.js
```

### Step 2: Copy Key Metrics
Copy relevant sections from the console output or JSON report.

### Step 3: Add to Your Report
Include in your "Design Evaluation" section:

**Example:**
```
## 6.1 Automated Analysis Results

Running the design analysis script revealed:

- **Total Files**: 44 files, 3,422 lines of code
- **High Coupling**: 4 controllers directly import models (violates DIP)
- **Low Cohesion**: 13 files mix state management, API calls, and calculations
- **External Dependencies**: 20 files directly depend on external services (Stripe, Clerk, Cloudinary)

[Include specific recommendations from the output]
```

## Additional Tools (Optional)

### 1. ESLint for Code Quality

```bash
# Already installed in client
cd client
npm run lint
```

### 2. Dependency-Cruiser (Coupling Visualization)

```bash
npm install --save-dev dependency-cruiser
npx depcruise --init
npx depcruise server/ --output-type dot | dot -T svg > dependency-graph.svg
```

### 3. Code Complexity Analysis

```bash
npm install -g plato
plato -r report -d report/plato server/
plato -r report -d report/plato client/src/
```

## Troubleshooting

### Error: "Cannot find module"
Make sure you're in the project root directory:
```bash
cd e:\LMS\-LMS-Website
node scripts/analyze-design.js
```

### Error: "Permission denied"
On Windows, you might need to run PowerShell as Administrator, or use:
```bash
node scripts/analyze-design.js
```

### No Output
Check that:
1. You have Node.js installed (`node --version`)
2. You're in the correct directory
3. The script file exists: `scripts/analyze-design.js`

## What the Analysis Covers

✅ **Automated Metrics**:
- File sizes and complexity
- Import counts and dependencies
- External service usage
- Mixed concerns detection

⚠️ **Requires Manual Review**:
- SOLID principles (needs code understanding)
- GRASP patterns (needs design context)
- Business logic evaluation
- Architecture decisions

**Recommendation**: Use automated analysis as a **starting point**, then supplement with manual analysis from `docs/Design_Evaluation.md`.

## Next Steps

1. ✅ Run the script
2. ✅ Review the output
3. ✅ Copy relevant metrics to your report
4. ✅ Reference specific files mentioned
5. ✅ Use recommendations to justify improvements
