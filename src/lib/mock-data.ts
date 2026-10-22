export interface ProblemData {
  id: string;
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  points: number;
  description: string;
  constraints: string[];
  examples: {
    input: string;
    output: string;
    explanation?: string;
  }[];
  starterCode: {
    javascript: string;
    python: string;
    cpp: string;
    java: string;
  };
  testCases: {
    id: number;
    input: string;
    expectedOutput: string;
    isHidden?: boolean;
  }[];
}

export interface ExamData {
  id: string;
  companyName: string;
  companyLogo: string;
  badgeColor: string;
  title: string;
  description: string;
  category: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  durationMinutes: number;
  totalPoints: number;
  passingScore: number;
  certificateTitle: string;
  signatureName: string;
  signatureRole: string;
  problems: ProblemData[];
}

export interface ProblemSubmissionDetail {
  problemId: string;
  problemTitle: string;
  points: number;
  difficulty?: "Easy" | "Medium" | "Hard";
  status: "Attempted - Passed" | "Attempted - Failed" | "Not Attempted";
  submittedCode?: string;
  language?: string;
  testCasesPassed?: number;
  totalTestCases?: number;
}

export interface SubmissionReportData {
  id: string;
  studentId: string;
  studentName: string;
  fatherName?: string;
  instituteName?: string;
  studentEmail: string;
  studentPhone: string;
  examId: string;
  examTitle: string;
  companyName: string;
  problemTitle: string;
  language: string;
  submittedCode: string;
  testCasesPassed: number;
  totalTestCases: number;
  scorePercentage: number;
  executionTimeMs: number;
  memoryKb: number;
  status: "Submitted & Evaluated";
  submittedAt: string;
  certificateId: string;
  certificateNumber: string;
  problemSubmissions?: ProblemSubmissionDetail[];
}

export interface CertificateData {
  id: string;
  serialNo?: string;
  certificateNumber: string;
  studentId: string;
  studentName: string;
  fatherName?: string;
  instituteName?: string;
  studentEmail: string;
  examId: string;
  examTitle: string;
  companyName: string;
  submissionId: string;
  scorePercentage: number;
  issuedAt: string;
  trainingPeriod?: string;
  startDate?: string;
  endDate?: string;
  premises?: string;
  directorName?: string;
  directorRole?: string;
  verificationHash: string;
  status: "Issued";
}

export const MOCK_EXAMS: ExamData[] = [
  {
    id: "exam-stripe-01",
    companyName: "Fintech Systems",
    companyLogo: "💳",
    badgeColor: "from-indigo-600 to-violet-700",
    title: "Idempotent Transaction Ledger Engine",
    description: "Design and implement a robust financial transaction processor that detects duplicate transactions, handles ledger balances, and maintains deterministic state ordering under concurrent arrival.",
    category: "Fintech Systems & Algorithms",
    difficulty: "Intermediate",
    durationMinutes: 45,
    totalPoints: 100,
    passingScore: 60,
    certificateTitle: "Fintech Systems Technical Assessment",
    signatureName: "Technical Assessment Board",
    signatureRole: "Chief Evaluation Architect",
    problems: [
      {
        id: "prob-stripe-1",
        title: "Idempotent Ledger Balance Verifier",
        difficulty: "Medium",
        points: 100,
        description: `You are building a high-throughput financial ledger reconciliation processor. 
Given an array of transaction records \`transactions\`, each with an \`id\` (string), \`accountId\` (string), and \`amount\` (integer in cents; positive for credit, negative for debit):

1. Transactions may be re-transmitted. If a transaction with the same \`id\` has already been processed for that account, skip it.
2. Compute the final settled balance for each account.
3. Return the account IDs sorted in alphabetical order along with their final balances in the format \`["ACC1:1500", "ACC2:-300"]\`.
4. If an account ends up with 0 balance, it must still be reported.`,
        constraints: [
          "1 <= transactions.length <= 10^5",
          "Transaction IDs are alphanumeric strings of length <= 32",
          "-1,000,000 <= amount <= 1,000,000",
          "Time Limit: 2.0s, Memory Limit: 256MB"
        ],
        examples: [
          {
            input: 'transactions = [["tx1", "ACC_A", 500], ["tx2", "ACC_B", 300], ["tx1", "ACC_A", 500], ["tx3", "ACC_A", -200]]',
            output: '["ACC_A:300", "ACC_B:300"]',
            explanation: '"tx1" is a duplicate and processed only once for ACC_A. Final ACC_A balance = 500 - 200 = 300.'
          },
          {
            input: 'transactions = [["tx10", "ORG_Z", 1000], ["tx11", "ORG_Y", -500]]',
            output: '["ORG_Y:-500", "ORG_Z:1000"]',
            explanation: 'Accounts are sorted alphabetically: ORG_Y precedes ORG_Z.'
          }
        ],
        starterCode: {
          javascript: `/**
 * @param {Array<[string, string, number]>} transactions
 * @return {Array<string>}
 */
function processTransactions(transactions) {
  const seenTx = new Set();
  const balances = new Map();

  for (const [txId, accountId, amount] of transactions) {
    if (seenTx.has(txId)) continue;
    seenTx.add(txId);

    const current = balances.get(accountId) || 0;
    balances.set(accountId, current + amount);
  }

  return Array.from(balances.keys())
    .sort()
    .map(acc => \`\${acc}:\${balances.get(acc)}\`);
}`,
          python: `def process_transactions(transactions):
    seen_tx = set()
    balances = {}
    
    for tx_id, acc_id, amount in transactions:
        if tx_id in seen_tx:
            continue
        seen_tx.add(tx_id)
        balances[acc_id] = balances.get(acc_id, 0) + amount
        
    sorted_accounts = sorted(balances.keys())
    return [f"{acc}:{balances[acc]}" for acc in sorted_accounts]`,
          cpp: `#include <vector>
#include <string>
#include <unordered_set>
#include <map>

std::vector<std::string> processTransactions(const std::vector<std::tuple<std::string, std::string, int>>& transactions) {
    std::unordered_set<std::string> seenTx;
    std::map<std::string, int> balances;
    
    for (const auto& [txId, accId, amount] : transactions) {
        if (seenTx.count(txId)) continue;
        seenTx.insert(txId);
        balances[accId] += amount;
    }
    
    std::vector<std::string> result;
    for (const auto& [acc, bal] : balances) {
        result.push_back(acc + ":" + std::to_string(bal));
    }
    return result;
}`,
          java: `import java.util.*;

public class Solution {
    public static List<String> processTransactions(List<Transaction> transactions) {
        Set<String> seenTx = new HashSet<>();
        Map<String, Integer> balances = new TreeMap<>();
        
        for (Transaction tx : transactions) {
            if (seenTx.contains(tx.id)) continue;
            seenTx.add(tx.id);
            balances.put(tx.accountId, balances.getOrDefault(tx.accountId, 0) + tx.amount);
        }
        
        List<String> result = new ArrayList<>();
        for (Map.Entry<String, Integer> entry : balances.entrySet()) {
            result.add(entry.getKey() + ":" + entry.getValue());
        }
        return result;
    }
}`
        },
        testCases: [
          {
            id: 1,
            input: 'transactions = [["tx1", "ACC_A", 500], ["tx2", "ACC_B", 300], ["tx1", "ACC_A", 500], ["tx3", "ACC_A", -200]]',
            expectedOutput: '["ACC_A:300", "ACC_B:300"]',
            isHidden: false
          },
          {
            id: 2,
            input: 'transactions = [["t0", "ALPHA", 100], ["t1", "BETA", 200], ["t2", "ALPHA", -50]]',
            expectedOutput: '["ALPHA:50", "BETA:200"]',
            isHidden: false
          },
          {
            id: 3,
            input: 'transactions = [["k1", "GAMMA", 0], ["k2", "GAMMA", 1000], ["k3", "DELTA", -1000]]',
            expectedOutput: '["DELTA:-1000", "GAMMA:1000"]',
            isHidden: true
          },
          {
            id: 4,
            input: 'transactions = [["x1", "USER_1", 50], ["x1", "USER_1", 9999]]',
            expectedOutput: '["USER_1:50"]',
            isHidden: true
          }
        ]
      },
      {
        id: "prob-stripe-2",
        title: "High-Frequency Transaction Anomaly Filter",
        difficulty: "Hard",
        points: 50,
        description: `Implement an active sliding-window fraud velocity filter for high-throughput transactions.
Given a list of transactions, identify accounts executing repeated high-value debits exceeding threshold within any rolling time window.

Return an array of flagged account identifiers sorted lexicographically.`,
        constraints: [
          "1 <= transactions.length <= 50,000",
          "Timestamps are strictly increasing ISO-8601 strings",
          "Time Limit: 1.5s, Memory Limit: 128MB"
        ],
        examples: [
          {
            input: 'transactions = [["ACC_1", "10:00:00", 2500], ["ACC_1", "10:04:00", 3000]], threshold = 2000',
            output: '["ACC_1"]',
            explanation: 'ACC_1 executed multiple transactions above threshold.'
          }
        ],
        starterCode: {
          javascript: `function detectAnomalousAccounts(transactions, threshold) {\n  // Implement sliding window detection\n  return [];\n}`,
          python: `def detect_anomalous_accounts(transactions, threshold):\n    # Implement sliding window\n    return []`,
          cpp: `#include <vector>\n#include <string>\n\nstd::vector<std::string> detectAnomalousAccounts() {\n    return {};\n}`,
          java: `import java.util.*;\n\npublic class Solution {\n    public static List<String> detectAnomalousAccounts() {\n        return new ArrayList<>();\n    }\n}`
        },
        testCases: [
          {
            id: 1,
            input: 'threshold = 2000',
            expectedOutput: '["ACC_1"]',
            isHidden: false
          },
          {
            id: 2,
            input: 'threshold = 5000',
            expectedOutput: '[]',
            isHidden: false
          }
        ]
      }
    ]
  },
  {
    id: "exam-google-02",
    companyName: "Cloud Systems",
    companyLogo: "☁️",
    badgeColor: "from-blue-600 to-cyan-600",
    title: "Distributed Cache Eviction & Key-Value Sharding",
    description: "Construct a thread-safe distributed cache partition coordinator implementing dual LRU-LFU eviction and consistent hashing boundary routing.",
    category: "Cloud Infrastructure & Distributed Systems",
    difficulty: "Advanced",
    durationMinutes: 60,
    totalPoints: 100,
    passingScore: 70,
    certificateTitle: "Cloud & Distributed Systems Assessment",
    signatureName: "Technical Assessment Board",
    signatureRole: "Senior Systems Architect",
    problems: [
      {
        id: "prob-google-1",
        title: "Adaptive Window LRU Cache",
        difficulty: "Hard",
        points: 100,
        description: `Implement an adaptive capacity cache that evicts items based on a hybrid least-recently-used score.
Given maximum capacity \`C\` and a series of operations \`["PUT", key, val]\` and \`["GET", key]\`:
- \`GET(key)\`: Returns the value of the key if it exists, otherwise \`-1\`. Updates recency.
- \`PUT(key, value)\`: Update or insert the value. If size exceeds \`C\`, evict the least recently used key.`,
        constraints: [
          "1 <= capacity <= 3000",
          "Operations length <= 2 * 10^5",
          "All keys and values are non-negative integers"
        ],
        examples: [
          {
            input: 'capacity = 2, operations = [["PUT", 1, 1], ["PUT", 2, 2], ["GET", 1], ["PUT", 3, 3], ["GET", 2]]',
            output: '[null, null, 1, null, -1]',
            explanation: 'Key 2 was evicted when key 3 was inserted because key 1 was accessed more recently.'
          }
        ],
        starterCode: {
          javascript: `class LRUCache {
  constructor(capacity) {
    this.capacity = capacity;
    this.map = new Map();
  }

  get(key) {
    if (!this.map.has(key)) return -1;
    const val = this.map.get(key);
    this.map.delete(key);
    this.map.set(key, val);
    return val;
  }

  put(key, value) {
    if (this.map.has(key)) {
      this.map.delete(key);
    } else if (this.map.size >= this.capacity) {
      const oldestKey = this.map.keys().next().value;
      this.map.delete(oldestKey);
    }
    this.map.set(key, value);
  }
}`,
          python: `class LRUCache:
    def __init__(self, capacity: int):
        self.capacity = capacity
        self.cache = {}

    def get(self, key: int) -> int:
        if key not in self.cache:
            return -1
        val = self.cache.pop(key)
        self.cache[key] = val
        return val

    def put(self, key: int, value: int) -> None:
        if key in self.cache:
            self.cache.pop(key)
        elif len(self.cache) >= self.capacity:
            oldest = next(iter(self.cache))
            del self.cache[oldest]
        self.cache[key] = value`,
          cpp: `// C++ starter implementation
#include <unordered_map>
#include <list>

class LRUCache {
    int cap;
    std::list<std::pair<int, int>> items;
    std::unordered_map<int, std::list<std::pair<int, int>>::iterator> lookup;
public:
    LRUCache(int capacity) : cap(capacity) {}
    int get(int key) {
        if (!lookup.count(key)) return -1;
        items.splice(items.begin(), items, lookup[key]);
        return lookup[key]->second;
    }
    void put(int key, int value) {
        if (lookup.count(key)) {
            items.splice(items.begin(), items, lookup[key]);
            lookup[key]->second = value;
            return;
        }
        if (items.size() == cap) {
            lookup.erase(items.back().first);
            items.pop_back();
        }
        items.emplace_front(key, value);
        lookup[key] = items.begin();
    }
};`,
          java: `import java.util.LinkedHashMap;
import java.util.Map;

class LRUCache {
    private final int capacity;
    private final LinkedHashMap<Integer, Integer> map;

    public LRUCache(int capacity) {
        this.capacity = capacity;
        this.map = new LinkedHashMap<Integer, Integer>(capacity, 0.75f, true) {
            protected boolean removeEldestEntry(Map.Entry<Integer, Integer> eldest) {
                return size() > capacity;
            }
        };
    }

    public int get(int key) {
        return map.getOrDefault(key, -1);
    }

    public void put(int key, int value) {
        map.put(key, value);
    }
}`
        },
        testCases: [
          {
            id: 1,
            input: 'operations = [["PUT", 1, 1], ["PUT", 2, 2], ["GET", 1], ["PUT", 3, 3], ["GET", 2]]',
            expectedOutput: '[null, null, 1, null, -1]',
            isHidden: false
          },
          {
            id: 2,
            input: 'operations = [["PUT", 1, 100], ["GET", 1], ["PUT", 1, 200], ["GET", 1]]',
            expectedOutput: '[null, 100, null, 200]',
            isHidden: false
          },
          {
            id: 3,
            input: 'operations = [["GET", 99]]',
            expectedOutput: '[-1]',
            isHidden: true
          }
        ]
      }
    ]
  },
  {
    id: "exam-amazon-03",
    companyName: "Logistics & Optimization",
    companyLogo: "📦",
    badgeColor: "from-amber-600 to-orange-600",
    title: "Fulfillment Route Optimization & Graph Traversal",
    description: "Solve critical warehouse package dispatch routing constraints using minimal spanning trees and dynamic route scheduling.",
    category: "Operations Logistics & Graph Algorithms",
    difficulty: "Intermediate",
    durationMinutes: 50,
    totalPoints: 100,
    passingScore: 65,
    certificateTitle: "Logistics & Graph Algorithms Assessment",
    signatureName: "Technical Assessment Board",
    signatureRole: "Optimization & Algorithms Lead",
    problems: [
      {
        id: "prob-amazon-1",
        title: "Minimum Dispatch Route Cost",
        difficulty: "Medium",
        points: 100,
        description: `Given a warehouse graph with \`n\` transit nodes connected by bidirectional routes represented as \`[u, v, cost]\`, find the minimum cost to establish a fully connected delivery network reaching every node.
If it is impossible to connect all delivery nodes, return \`-1\`.`,
        constraints: [
          "2 <= n <= 1000",
          "1 <= routes.length <= 10^4",
          "1 <= cost <= 10^5"
        ],
        examples: [
          {
            input: 'n = 3, routes = [[1, 2, 5], [1, 3, 6], [2, 3, 1]]',
            output: '6',
            explanation: 'Pick route (2, 3, 1) and route (1, 2, 5). Total cost = 1 + 5 = 6.'
          }
        ],
        starterCode: {
          javascript: `function minimumDispatchCost(n, routes) {
  // Sort edges by cost
  routes.sort((a, b) => a[2] - b[2]);
  
  const parent = Array.from({ length: n + 1 }, (_, i) => i);
  function find(x) {
    if (parent[x] === x) return x;
    return parent[x] = find(parent[x]);
  }
  
  let totalCost = 0;
  let edgesUsed = 0;
  
  for (const [u, v, cost] of routes) {
    const rootU = find(u);
    const rootV = find(v);
    if (rootU !== rootV) {
      parent[rootU] = rootV;
      totalCost += cost;
      edgesUsed++;
      if (edgesUsed === n - 1) return totalCost;
    }
  }
  
  return edgesUsed === n - 1 ? totalCost : -1;
}`,
          python: `def minimum_dispatch_cost(n: int, routes: list) -> int:
    routes.sort(key=lambda x: x[2])
    parent = list(range(n + 1))
    
    def find(x):
        if parent[x] != x:
            parent[x] = find(parent[x])
        return parent[x]
        
    total_cost = 0
    edges_used = 0
    
    for u, v, cost in routes:
        ru, rv = find(u), find(v)
        if ru != rv:
            parent[ru] = rv
            total_cost += cost
            edges_used += 1
            if edges_used == n - 1:
                return total_cost
                
    return total_cost if edges_used == n - 1 else -1`,
          cpp: `#include <vector>
#include <algorithm>
#include <numeric>

int minimumDispatchCost(int n, std::vector<std::vector<int>>& routes) {
    std::sort(routes.begin(), routes.end(), [](const auto& a, const auto& b) {
        return a[2] < b[2];
    });
    std::vector<int> parent(n + 1);
    std::iota(parent.begin(), parent.end(), 0);
    
    auto find = [&](auto& self, int x) -> int {
        return parent[x] == x ? x : parent[x] = self(self, parent[x]);
    };
    
    int cost = 0, count = 0;
    for (const auto& r : routes) {
        int ru = find(find, r[0]);
        int rv = find(find, r[1]);
        if (ru != rv) {
            parent[ru] = rv;
            cost += r[2];
            if (++count == n - 1) return cost;
        }
    }
    return count == n - 1 ? cost : -1;
}`,
          java: `import java.util.*;

public class Solution {
    public static int minimumDispatchCost(int n, int[][] routes) {
        Arrays.sort(routes, Comparator.comparingInt(a -> a[2]));
        int[] parent = new int[n + 1];
        for (int i = 0; i <= n; i++) parent[i] = i;

        int cost = 0, edges = 0;
        for (int[] r : routes) {
            int ru = find(parent, r[0]);
            int rv = find(parent, r[1]);
            if (ru != rv) {
                parent[ru] = rv;
                cost += r[2];
                if (++edges == n - 1) return cost;
            }
        }
        return edges == n - 1 ? cost : -1;
    }

    private static int find(int[] parent, int x) {
        if (parent[x] == x) return x;
        return parent[x] = find(parent, parent[x]);
    }
}`
        },
        testCases: [
          {
            id: 1,
            input: 'n = 3, routes = [[1, 2, 5], [1, 3, 6], [2, 3, 1]]',
            expectedOutput: '6',
            isHidden: false
          },
          {
            id: 2,
            input: 'n = 4, routes = [[1, 2, 1], [2, 3, 2], [3, 4, 3], [1, 4, 10]]',
            expectedOutput: '6',
            isHidden: false
          },
          {
            id: 3,
            input: 'n = 3, routes = [[1, 2, 10]]',
            expectedOutput: '-1',
            isHidden: true
          }
        ]
      }
    ]
  }
];

export const INITIAL_SUBMISSIONS: SubmissionReportData[] = [
  {
    id: "sub-naveen-01",
    studentId: "std-demo-03",
    studentName: "M. Naveen",
    fatherName: "M. Sankara",
    instituteName: "DODLA DAIRY LIMITED",
    studentEmail: "student@test.com",
    studentPhone: "9988776655",
    examId: "exam-stripe-01",
    examTitle: "Idempotent Transaction Ledger Engine",
    companyName: "Fintech Systems",
    problemTitle: "Idempotent Ledger Balance Verifier",
    language: "javascript",
    submittedCode: `function processTransactions(transactions) {
  const seenTx = new Set();
  const balances = new Map();

  for (const [txId, accountId, amount] of transactions) {
    if (seenTx.has(txId)) continue;
    seenTx.add(txId);

    const current = balances.get(accountId) || 0;
    balances.set(accountId, current + amount);
  }

  return Array.from(balances.keys())
    .sort()
    .map(acc => \`\${acc}:\${balances.get(acc)}\`);
}`,
    testCasesPassed: 4,
    totalTestCases: 4,
    scorePercentage: 85,
    executionTimeMs: 34,
    memoryKb: 18240,
    status: "Submitted & Evaluated",
    submittedAt: "2026-10-21T10:30:00Z",
    certificateId: "cert-naveen-14471",
    certificateNumber: "14471",
    problemSubmissions: [
      {
        problemId: "prob-stripe-1",
        problemTitle: "Idempotent Ledger Balance Verifier",
        points: 50,
        difficulty: "Medium",
        status: "Attempted - Passed",
        submittedCode: `function processTransactions(transactions) {
  const seenTx = new Set();
  const balances = new Map();

  for (const [txId, accountId, amount] of transactions) {
    if (seenTx.has(txId)) continue;
    seenTx.add(txId);

    const current = balances.get(accountId) || 0;
    balances.set(accountId, current + amount);
  }

  return Array.from(balances.keys())
    .sort()
    .map(acc => \`\${acc}:\${balances.get(acc)}\`);
}`,
        language: "javascript",
        testCasesPassed: 4,
        totalTestCases: 4,
      },
      {
        problemId: "prob-stripe-2",
        problemTitle: "High-Frequency Transaction Anomaly Filter",
        points: 50,
        difficulty: "Hard",
        status: "Not Attempted",
        submittedCode: "",
        language: "javascript",
        testCasesPassed: 0,
        totalTestCases: 2,
      },
    ],
  },
  {
    id: "sub-alex-01",
    studentId: "std-alex-01",
    studentName: "Alex Mercer",
    fatherName: "Arthur Mercer",
    instituteName: "FINTECH SYSTEMS",
    studentEmail: "alex.mercer@cs.edu",
    studentPhone: "9876543210",
    examId: "exam-stripe-01",
    examTitle: "Idempotent Transaction Ledger Engine",
    companyName: "Fintech Systems",
    problemTitle: "Idempotent Ledger Balance Verifier",
    language: "python",
    submittedCode: `def process_transactions(transactions):
    seen_tx = set()
    balances = {}
    for tx_id, acc_id, amount in transactions:
        if tx_id in seen_tx:
            continue
        seen_tx.add(tx_id)
        balances[acc_id] = balances.get(acc_id, 0) + amount
    sorted_accounts = sorted(balances.keys())
    return [f"{acc}:{balances[acc]}" for acc in sorted_accounts]`,
    testCasesPassed: 4,
    totalTestCases: 4,
    scorePercentage: 100,
    executionTimeMs: 42,
    memoryKb: 19100,
    status: "Submitted & Evaluated",
    submittedAt: "2026-10-20T14:15:00Z",
    certificateId: "cert-alex-14472",
    certificateNumber: "14472",
    problemSubmissions: [
      {
        problemId: "prob-stripe-1",
        problemTitle: "Idempotent Ledger Balance Verifier",
        points: 50,
        difficulty: "Medium",
        status: "Attempted - Passed",
        submittedCode: `def process_transactions(transactions):
    seen_tx = set()
    balances = {}
    for tx_id, acc_id, amount in transactions:
        if tx_id in seen_tx:
            continue
        seen_tx.add(tx_id)
        balances[acc_id] = balances.get(acc_id, 0) + amount
    sorted_accounts = sorted(balances.keys())
    return [f"{acc}:{balances[acc]}" for acc in sorted_accounts]`,
        language: "python",
        testCasesPassed: 4,
        totalTestCases: 4,
      },
      {
        problemId: "prob-stripe-2",
        problemTitle: "High-Frequency Transaction Anomaly Filter",
        points: 50,
        difficulty: "Hard",
        status: "Attempted - Passed",
        submittedCode: `def detect_anomalous_accounts(transactions, threshold):
    flagged = set()
    for acc, ts, amount in transactions:
        if amount > threshold:
            flagged.add(acc)
    return sorted(list(flagged))`,
        language: "python",
        testCasesPassed: 2,
        totalTestCases: 2,
      },
    ],
  },
  {
    id: "sub-sarah-01",
    studentId: "std-sarah-02",
    studentName: "Sarah Chen",
    fatherName: "Li Chen",
    instituteName: "CLOUD SYSTEMS",
    studentEmail: "sarah.chen@tech.org",
    studentPhone: "9123456780",
    examId: "exam-google-02",
    examTitle: "Distributed Cache Eviction & Key-Value Sharding",
    companyName: "Cloud Systems",
    problemTitle: "Dual LRU-LFU Cache Partition Coordinator",
    language: "cpp",
    submittedCode: `#include <unordered_map>
#include <list>

class LRUCache {
    int cap;
    std::list<std::pair<int, int>> items;
    std::unordered_map<int, std::list<std::pair<int, int>>::iterator> lookup;
public:
    LRUCache(int capacity) : cap(capacity) {}
    
    int get(int key) {
        if (!lookup.count(key)) return -1;
        items.splice(items.begin(), items, lookup[key]);
        return lookup[key]->second;
    }
    
    void put(int key, int value) {
        if (lookup.count(key)) {
            items.splice(items.begin(), items, lookup[key]);
            lookup[key]->second = value;
            return;
        }
        if (items.size() == cap) {
            lookup.erase(items.back().first);
            items.pop_back();
        }
        items.emplace_front(key, value);
        lookup[key] = items.begin();
    }
};`,
    testCasesPassed: 3,
    totalTestCases: 3,
    scorePercentage: 92,
    executionTimeMs: 28,
    memoryKb: 16800,
    status: "Submitted & Evaluated",
    submittedAt: "2026-10-19T16:45:00Z",
    certificateId: "cert-sarah-14473",
    certificateNumber: "14473",
    problemSubmissions: [
      {
        problemId: "prob-google-1",
        problemTitle: "Dual LRU-LFU Cache Partition Coordinator",
        points: 100,
        difficulty: "Hard",
        status: "Attempted - Passed",
        submittedCode: `#include <unordered_map>
#include <list>

class LRUCache {
    int cap;
    std::list<std::pair<int, int>> items;
    std::unordered_map<int, std::list<std::pair<int, int>>::iterator> lookup;
public:
    LRUCache(int capacity) : cap(capacity) {}
    
    int get(int key) {
        if (!lookup.count(key)) return -1;
        items.splice(items.begin(), items, lookup[key]);
        return lookup[key]->second;
    }
    
    void put(int key, int value) {
        if (lookup.count(key)) {
            items.splice(items.begin(), items, lookup[key]);
            lookup[key]->second = value;
            return;
        }
        if (items.size() == cap) {
            lookup.erase(items.back().first);
            items.pop_back();
        }
        items.emplace_front(key, value);
        lookup[key] = items.begin();
    }
};`,
        language: "cpp",
        testCasesPassed: 3,
        totalTestCases: 3,
      },
    ],
  },
];

export const INITIAL_CERTIFICATES: CertificateData[] = [
  {
    id: "cert-naveen-14471",
    serialNo: "14471",
    certificateNumber: "14471",
    studentId: "std-demo-03",
    studentName: "M. NAVEEN",
    fatherName: "M. SANKARA",
    instituteName: "DODLA DAIRY LIMITED",
    studentEmail: "student@test.com",
    examId: "exam-stripe-01",
    examTitle: "Idempotent Transaction Ledger Engine",
    companyName: "DODLA DAIRY LIMITED, Andhra Pradesh",
    submissionId: "sub-naveen-01",
    scorePercentage: 85,
    issuedAt: "2026-10-21T10:35:00Z",
    trainingPeriod: "3 Days",
    startDate: "06-10-2026",
    endDate: "08-10-2026",
    premises: "CHITTOOR FIRE STATION",
    directorName: "P.VENKATA RAMANA",
    directorRole: "Director, A.P. Fire Services and Civil Defence",
    verificationHash: "APFS-CDTI-STD-DEMO-03-14471",
    status: "Issued",
  },
  {
    id: "cert-alex-14472",
    serialNo: "14472",
    certificateNumber: "14472",
    studentId: "std-alex-01",
    studentName: "ALEX MERCER",
    fatherName: "ARTHUR MERCER",
    instituteName: "FINTECH SYSTEMS",
    studentEmail: "alex.mercer@cs.edu",
    examId: "exam-stripe-01",
    examTitle: "Idempotent Transaction Ledger Engine",
    companyName: "Fintech Systems, Andhra Pradesh",
    submissionId: "sub-alex-01",
    scorePercentage: 100,
    issuedAt: "2026-10-20T14:20:00Z",
    trainingPeriod: "3 Days",
    startDate: "06-10-2026",
    endDate: "08-10-2026",
    premises: "CHITTOOR FIRE STATION",
    directorName: "P.VENKATA RAMANA",
    directorRole: "Director, A.P. Fire Services and Civil Defence",
    verificationHash: "APFS-CDTI-STD-ALEX-01-14472",
    status: "Issued",
  },
  {
    id: "cert-sarah-14473",
    serialNo: "14473",
    certificateNumber: "14473",
    studentId: "std-sarah-02",
    studentName: "SARAH CHEN",
    fatherName: "LI CHEN",
    instituteName: "CLOUD SYSTEMS",
    studentEmail: "sarah.chen@tech.org",
    examId: "exam-google-02",
    examTitle: "Distributed Cache Eviction & Key-Value Sharding",
    companyName: "Cloud Systems, Andhra Pradesh",
    submissionId: "sub-sarah-01",
    scorePercentage: 92,
    issuedAt: "2026-10-19T16:50:00Z",
    trainingPeriod: "3 Days",
    startDate: "06-10-2026",
    endDate: "08-10-2026",
    premises: "CHITTOOR FIRE STATION",
    directorName: "P.VENKATA RAMANA",
    directorRole: "Director, A.P. Fire Services and Civil Defence",
    verificationHash: "APFS-CDTI-STD-SARAH-02-14473",
    status: "Issued",
  },
];

