# Graphify Merge Commands

## Quick merge (if graphify-meta reports are already refreshed)

cd /home/anik2003/Documents/omeswap
/graphify graphify-meta --mode deep
mkdir -p .graphify-runs/25-meta-project-graph
cp -a graphify-out/. .graphify-runs/25-meta-project-graph/

## Full refresh then merge (safe for all-slice updates)

cd /home/anik2003/Documents/omeswap
mkdir -p graphify-meta

cp README.md graphify-meta/00-root-README.md
cp IMPLEMENTATION_SUMMARY.md graphify-meta/01-implementation-summary.md
cp .graphify-runs/01-app-shell/graphify-out/GRAPH_REPORT.md graphify-meta/10-app-shell-report.md
cp .graphify-runs/05-components-ui/graphify-out/GRAPH_REPORT.md graphify-meta/11-ui-kit-report.md
cp .graphify-runs/06-trade-components/GRAPH_REPORT.md graphify-meta/12-trade-report.md
cp .graphify-runs/11-portfolio/GRAPH_REPORT.md graphify-meta/13-portfolio-report.md
cp .graphify-runs/18-agent-builder-components/GRAPH_REPORT.md graphify-meta/14-agent-builder-components-report.md
cp .graphify-runs/19-agent-builder-lib/GRAPH_REPORT.md graphify-meta/15-agent-builder-lib-report.md
cp .graphify-runs/22-avax-agent/GRAPH_REPORT.md graphify-meta/16-avax-agent-report.md
cp .graphify-runs/16-lib-api/GRAPH_REPORT.md graphify-meta/17-lib-api-report.md
cp .graphify-runs/17-app-api/GRAPH_REPORT.md graphify-meta/18-app-api-report.md

/graphify graphify-meta --mode deep

mkdir -p .graphify-runs/25-meta-project-graph
cp -a graphify-out/. .graphify-runs/25-meta-project-graph/
