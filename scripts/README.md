# Design Evaluation Analysis Tools

This directory contains scripts and tools to analyze your codebase for design evaluation metrics.

## Quick Start

### 1. Run the Analysis Script

```bash
# From project root
node scripts/analyze-design.js
```

This will generate:
- Console output with metrics and recommendations
- `design-analysis-report.json` with detailed data

### 2. Install Additional Analysis Tools (Optional)

#### A. Dependency-Cruiser (Coupling Analysis)

```bash
npm install --save-dev dependency-cruiser
npx depcruise --init
npx depcruise src --output-type err --config .dependency-cruiser.js
```

#### B. ESLint with Complexity Plugin

```bash
npm install --save-dev eslint-plugin-complexity
```

Add to `.eslintrc.js`:
```javascript
{
  "plugins": ["complexity"],
  "rules": {
    "complexity": ["warn", 10]
  }
}
```

#### C. Code Metrics Tools

```bash
# Install plato for code metrics
npm install -g plato

# Analyze code
plato -r report -d report/plato server/
plato -r report -d report/plato client/src/
```

## What the Script Analyzes

### 1. **File Metrics**
- Total files, lines of code
- Average file size
- Largest files

### 2. **Complexity Analysis**
- High/Medium/Low complexity files
- Based on line count and function count

### 3. **Coupling Analysis**
- External service dependencies (Stripe, Clerk, Cloudinary, MongoDB)
- Direct model imports (indicator of high coupling)
- Import counts per file

### 4. **Cohesion Analysis**
- Files with mixed concerns (State + API + Calculations)
- Identifies low cohesion files

### 5. **SOLID/GRASP Indicators**
- SRP violations (mixed concerns)
- DIP violations (direct dependencies)
- Low coupling metrics
- High cohesion metrics

## Interpreting Results

### High Coupling Indicators
- Many direct imports from `models/`
- Direct usage of external services (Stripe, Clerk)
- **Recommendation**: Introduce service/repository layers

### Low Cohesion Indicators
- Files mixing state management + API calls + calculations
- **Recommendation**: Split into separate concerns

### High Complexity Indicators
- Files with >200 lines or >10 functions
- **Recommendation**: Refactor into smaller modules

## Example Output

```
📊 FILE METRICS
Total Files Analyzed: 45
Total Lines of Code: 8,234
Average File Size: 183 lines

🔗 COUPLING ANALYSIS
External Service Dependencies:
  - Stripe: 2 files
  - Clerk: 3 files
  - Cloudinary: 1 files

⚠️  HIGH COUPLING DETECTED:
   - Consider introducing abstraction layers
```

## Using Results in Your Report

1. **Run the script** and copy metrics to your report
2. **Reference specific files** mentioned in the analysis
3. **Use recommendations** to justify design improvements
4. **Compare before/after** if you refactor code

## Limitations

⚠️ **Note**: Automated analysis provides **metrics and indicators**, but full SOLID/GRASP evaluation requires:
- Manual code review
- Understanding of business logic
- Context-aware analysis

Use this script as a **starting point** and supplement with manual analysis from `docs/Design_Evaluation.md`.
