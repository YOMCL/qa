import { Reporter, TestCase, TestResult } from '@playwright/test/reporter';
import * as fs from 'fs';
import * as path from 'path';

interface FeatureGroup {
  name: string;
  tests: Array<{
    title: string;
    status: 'passed' | 'failed' | 'skipped';
    duration: number;
    error?: string;
  }>;
}

interface TestGroup {
  type: string;
  name: string;
  icon: string;
  features: Record<string, FeatureGroup>;
}

export default class GroupedReporter implements Reporter {
  private groups: Map<string, TestGroup> = new Map();
  private stats = { passed: 0, failed: 0, skipped: 0, total: 0 };

  onTestEnd(test: TestCase, result: TestResult) {
    this.stats.total++;

    if (result.status === 'passed') this.stats.passed++;
    else if (result.status === 'failed') this.stats.failed++;
    else if (result.status === 'skipped') this.stats.skipped++;

    // Extraer tags
    const tags = test.title.match(/@(\w+)/g) || [];
    const feature = tags.find(t => !['crítico', 'funcional', 'configuración', 'regresión'].includes(t.substring(1)))?.substring(1) || 'General';
    const typeTag = tags.find(t => ['crítico', 'funcional', 'configuración', 'regresión'].includes(t.substring(1)))?.substring(1) || 'Funcional';

    const typeMap: Record<string, {name: string, icon: string}> = {
      'crítico': { name: '🔴 Críticos', icon: '🔴' },
      'funcional': { name: '🟡 Funcionales', icon: '🟡' },
      'configuración': { name: '🔵 Configuración', icon: '🔵' },
      'regresión': { name: '🟠 Regresión', icon: '🟠' },
    };

    const typeInfo = typeMap[typeTag] || { name: '⚪ Otros', icon: '⚪' };

    if (!this.groups.has(typeTag)) {
      this.groups.set(typeTag, {
        type: typeTag,
        name: typeInfo.name,
        icon: typeInfo.icon,
        features: {},
      });
    }

    const group = this.groups.get(typeTag)!;
    if (!group.features[feature]) {
      group.features[feature] = {
        name: feature,
        tests: [],
      };
    }

    // Limpiar título de tags
    const cleanTitle = test.title.replace(/@\w+\s*/g, '');

    group.features[feature].tests.push({
      title: cleanTitle,
      status: result.status,
      duration: result.duration,
      error: result.error?.message,
    });
  }

  async onEnd() {
    const html = this.generateHtml();
    const reportPath = path.join(process.cwd(), 'playwright-report', 'grouped-report.html');
    fs.mkdirSync(path.dirname(reportPath), { recursive: true });
    fs.writeFileSync(reportPath, html);
    console.log(`✅ Grouped report generated: ${reportPath}`);
  }

  private generateHtml(): string {
    // Ordenar tipos por severidad: crítico > funcional > configuración > regresión > otros
    const typeOrder = ['crítico', 'funcional', 'configuración', 'regresión'];
    const sortedGroups = Array.from(this.groups.values()).sort((a, b) => {
      const aIndex = typeOrder.indexOf(a.type);
      const bIndex = typeOrder.indexOf(b.type);
      if (aIndex === -1 && bIndex === -1) return 0;
      if (aIndex === -1) return 1;
      if (bIndex === -1) return -1;
      return aIndex - bIndex;
    });

    const groupsHtml = sortedGroups.map(group => {
      const featureEntries = Object.entries(group.features).sort((a, b) =>
        a[0].localeCompare(b[0])
      );

      const groupStats = featureEntries.reduce((acc, [_, feature]) => {
        acc.passed += feature.tests.filter(t => t.status === 'passed').length;
        acc.failed += feature.tests.filter(t => t.status === 'failed').length;
        acc.skipped += feature.tests.filter(t => t.status === 'skipped').length;
        acc.total += feature.tests.length;
        return acc;
      }, { passed: 0, failed: 0, skipped: 0, total: 0 });

      const passRate = groupStats.total > 0 ? Math.round((groupStats.passed / groupStats.total) * 100) : 0;

      return `
        <div class="type-section">
          <div class="type-header">
            <h2>${group.icon} ${group.name}</h2>
            <span class="stats">${groupStats.passed}/${groupStats.total} passed (${passRate}%)</span>
          </div>

          ${featureEntries.map(([feature, featureGroup]) => {
            const featurePassed = featureGroup.tests.filter(t => t.status === 'passed').length;
            return `
              <div class="feature-group">
                <h3>📌 ${featureGroup.name} (${featurePassed}/${featureGroup.tests.length})</h3>
                <ul class="tests">
                  ${featureGroup.tests.map(test => `
                    <li class="test ${test.status}">
                      <span class="status-icon">${test.status === 'passed' ? '✓' : test.status === 'failed' ? '✗' : '⊘'}</span>
                      <span class="test-title">${test.title}</span>
                      <span class="duration">${test.duration}ms</span>
                      ${test.error ? `<pre class="error">${escapeHtml(test.error)}</pre>` : ''}
                    </li>
                  `).join('')}
                </ul>
              </div>
            `;
          }).join('')}
        </div>
      `;
    }).join('');

    return `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>YOM QA — Grouped Test Report</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #f5f5f5;
            padding: 2rem;
          }
          .container { max-width: 1200px; margin: 0 auto; }
          header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 2rem;
            border-radius: 8px;
            margin-bottom: 2rem;
          }
          header h1 { font-size: 2rem; margin-bottom: 1rem; }
          .summary {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 1rem;
            margin-top: 1rem;
          }
          .summary-item {
            background: rgba(255,255,255,0.2);
            padding: 1rem;
            border-radius: 6px;
            text-align: center;
          }
          .summary-item strong { font-size: 1.5rem; display: block; }
          .summary-item span { font-size: 0.9rem; opacity: 0.9; }

          .type-section {
            background: white;
            border-radius: 8px;
            margin-bottom: 2rem;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          }
          .type-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 1.5rem;
            border-left: 6px solid #333;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .type-header h2 { font-size: 1.5rem; font-weight: 700; }
          .stats {
            background: rgba(255,255,255,0.2);
            color: white;
            padding: 0.5rem 1rem;
            border-radius: 20px;
            font-size: 0.85rem;
            font-weight: 600;
          }

          .feature-group {
            padding: 1.5rem;
            border-bottom: 1px solid #eee;
            background: #fafafa;
          }
          .feature-group:last-child { border-bottom: none; background: white; }
          .feature-group h3 {
            font-size: 1.1rem;
            margin-bottom: 1rem;
            color: #333;
            font-weight: 600;
          }

          .tests {
            list-style: none;
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 1rem;
          }
          .test {
            padding: 1rem;
            border-radius: 6px;
            background: #f8f9fa;
            border-left: 3px solid #ccc;
            display: flex;
            align-items: center;
            gap: 0.75rem;
            font-size: 0.9rem;
          }
          .test.passed {
            border-left-color: #28a745;
            background: #f0f9f6;
          }
          .test.failed {
            border-left-color: #dc3545;
            background: #fef5f6;
          }
          .test.skipped {
            border-left-color: #ffc107;
            background: #fffef5;
          }

          .status-icon {
            font-weight: bold;
            font-size: 1.1rem;
          }
          .test.passed .status-icon { color: #28a745; }
          .test.failed .status-icon { color: #dc3545; }
          .test.skipped .status-icon { color: #ffc107; }

          .test-title {
            flex: 1;
            color: #333;
          }
          .duration {
            background: rgba(0,0,0,0.05);
            padding: 0.25rem 0.75rem;
            border-radius: 4px;
            font-size: 0.8rem;
            color: #666;
            white-space: nowrap;
          }

          .error {
            grid-column: 1 / -1;
            background: #fff3cd;
            padding: 1rem;
            border-radius: 4px;
            font-size: 0.8rem;
            color: #333;
            margin-top: 0.5rem;
            overflow-x: auto;
            border-left: 3px solid #ffc107;
          }

          footer {
            text-align: center;
            color: #999;
            font-size: 0.85rem;
            margin-top: 3rem;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <header>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
              <h1 style="margin: 0;">🧪 Grouped Test Report</h1>
              <a href="../../index.html" style="padding: 0.75rem 1.5rem; background: #667eea; color: white; text-decoration: none; border-radius: 6px; font-weight: 600; transition: background 0.3s;">← Volver al Dashboard</a>
            </div>
            <div class="summary">
              <div class="summary-item">
                <strong>${this.stats.total}</strong>
                <span>Total Tests</span>
              </div>
              <div class="summary-item">
                <strong>${this.stats.passed}</strong>
                <span>Passed</span>
              </div>
              <div class="summary-item">
                <strong>${this.stats.failed}</strong>
                <span>Failed</span>
              </div>
              <div class="summary-item">
                <strong>${this.stats.skipped}</strong>
                <span>Skipped</span>
              </div>
            </div>
          </header>

          ${groupsHtml}

          <footer>
            Generated on ${new Date().toLocaleString('es-CL', { timeZone: 'America/Santiago' })}
          </footer>
        </div>
      </body>
      </html>
    `;
  }
}

function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}
