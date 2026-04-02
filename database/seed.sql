truncate table session_answers restart identity cascade;
truncate table session_batches restart identity cascade;
truncate table quiz_sessions restart identity cascade;
truncate table app_users restart identity cascade;
truncate table questions restart identity cascade;

insert into questions (subject, topic, subtopic, type, prompt, options, accepted_answers, explanation, metadata)
values
  (
    'OS',
    'Process Management',
    'Scheduling',
    'mcq',
    'Which scheduling algorithm can cause starvation for long CPU-bound jobs if short jobs keep arriving?',
    '[{"id":"a","text":"Round Robin","isCorrect":false},{"id":"b","text":"First Come First Serve","isCorrect":false},{"id":"c","text":"Shortest Job First","isCorrect":true},{"id":"d","text":"Rate Monotonic","isCorrect":false}]'::jsonb,
    '[]'::jsonb,
    'Shortest Job First favors shorter jobs, so long jobs may wait indefinitely in a busy system.',
    '{}'::jsonb
  ),
  (
    'OS',
    'Process Management',
    'Scheduling',
    'short_text',
    'Name the scheduling metric defined as completion time minus arrival time.',
    '[]'::jsonb,
    '["turnaround time","turnaround"]'::jsonb,
    'Turnaround time measures total time spent in the system from arrival to completion.',
    '{}'::jsonb
  ),
  (
    'OS',
    'Process Management',
    'Scheduling',
    'mcq',
    'In Round Robin scheduling, what does decreasing the time quantum too much usually increase?',
    '[{"id":"a","text":"Context switching overhead","isCorrect":true},{"id":"b","text":"CPU burst length","isCorrect":false},{"id":"c","text":"Mutual exclusion","isCorrect":false},{"id":"d","text":"Page size","isCorrect":false}]'::jsonb,
    '[]'::jsonb,
    'Very small quanta make the CPU switch between processes more often, increasing overhead.',
    '{}'::jsonb
  ),
  (
    'OS',
    'Process Management',
    'Deadlocks',
    'mcq',
    'Which Coffman condition says a process holding resources can request additional resources?',
    '[{"id":"a","text":"Mutual exclusion","isCorrect":false},{"id":"b","text":"Hold and wait","isCorrect":true},{"id":"c","text":"No preemption","isCorrect":false},{"id":"d","text":"Circular wait","isCorrect":false}]'::jsonb,
    '[]'::jsonb,
    'Hold and wait means a process keeps what it has while waiting for more resources.',
    '{}'::jsonb
  ),
  (
    'OS',
    'Process Management',
    'Deadlocks',
    'short_text',
    'What directed graph is commonly used to model a deadlock when each resource type has a single instance?',
    '[]'::jsonb,
    '["resource allocation graph","rag"]'::jsonb,
    'A resource allocation graph shows processes, resources, and request or assignment edges.',
    '{}'::jsonb
  ),
  (
    'OS',
    'Process Management',
    'Deadlocks',
    'mcq',
    'Banker''s algorithm is mainly used for deadlock what?',
    '[{"id":"a","text":"Recovery","isCorrect":false},{"id":"b","text":"Avoidance","isCorrect":true},{"id":"c","text":"Detection","isCorrect":false},{"id":"d","text":"Ignorance","isCorrect":false}]'::jsonb,
    '[]'::jsonb,
    'Banker''s algorithm checks whether granting a request keeps the system in a safe state.',
    '{}'::jsonb
  ),
  (
    'OS',
    'Memory Management',
    'Paging',
    'mcq',
    'What is the main purpose of a page table in a paging system?',
    '[{"id":"a","text":"Translate logical pages to physical frames","isCorrect":true},{"id":"b","text":"Store process priorities","isCorrect":false},{"id":"c","text":"Track CPU bursts","isCorrect":false},{"id":"d","text":"Encrypt memory contents","isCorrect":false}]'::jsonb,
    '[]'::jsonb,
    'The page table maps a process logical address space onto physical memory frames.',
    '{}'::jsonb
  ),
  (
    'OS',
    'Memory Management',
    'Paging',
    'short_text',
    'If a required page is not in main memory, the event is called a what?',
    '[]'::jsonb,
    '["page fault"]'::jsonb,
    'A page fault occurs when the processor references a page that must be fetched from secondary storage.',
    '{}'::jsonb
  ),
  (
    'OS',
    'Memory Management',
    'Paging',
    'mcq',
    'Belady''s anomaly is associated with which page replacement algorithm?',
    '[{"id":"a","text":"LRU","isCorrect":false},{"id":"b","text":"FIFO","isCorrect":true},{"id":"c","text":"Optimal","isCorrect":false},{"id":"d","text":"Clock","isCorrect":false}]'::jsonb,
    '[]'::jsonb,
    'FIFO can oddly produce more page faults when the number of frames increases.',
    '{}'::jsonb
  ),
  (
    'OS',
    'Synchronization',
    'Semaphores',
    'mcq',
    'Which semaphore operation is usually used to release a resource?',
    '[{"id":"a","text":"wait","isCorrect":false},{"id":"b","text":"signal","isCorrect":true},{"id":"c","text":"sleep","isCorrect":false},{"id":"d","text":"yield","isCorrect":false}]'::jsonb,
    '[]'::jsonb,
    'The signal or V operation increments the semaphore and may wake a waiting process.',
    '{}'::jsonb
  ),
  (
    'OS',
    'Synchronization',
    'Semaphores',
    'short_text',
    'What property ensures that only one process enters the critical section at a time?',
    '[]'::jsonb,
    '["mutual exclusion"]'::jsonb,
    'Mutual exclusion guarantees exclusive access to the critical section.',
    '{}'::jsonb
  ),
  (
    'OS',
    'Synchronization',
    'Semaphores',
    'mcq',
    'A binary semaphore can take how many distinct values?',
    '[{"id":"a","text":"1","isCorrect":false},{"id":"b","text":"2","isCorrect":true},{"id":"c","text":"3","isCorrect":false},{"id":"d","text":"Infinite","isCorrect":false}]'::jsonb,
    '[]'::jsonb,
    'A binary semaphore uses only 0 and 1 to indicate availability.',
    '{}'::jsonb
  ),
  (
    'OS',
    'Process Management',
    'Scheduling',
    'mcq',
    'Which scheduling policy assigns CPU time to each process in circular order with a fixed time quantum?',
    '[{"id":"a","text":"Shortest Remaining Time First","isCorrect":false},{"id":"b","text":"Round Robin","isCorrect":true},{"id":"c","text":"Priority Scheduling","isCorrect":false},{"id":"d","text":"Multilevel Feedback Queue","isCorrect":false}]'::jsonb,
    '[]'::jsonb,
    'Round Robin rotates among ready processes, giving each one a fixed quantum.',
    '{}'::jsonb
  ),
  (
    'OS',
    'Process Management',
    'Deadlocks',
    'mcq',
    'A system state where deadlock can still be avoided if resources are allocated carefully is called what?',
    '[{"id":"a","text":"Unsafe state","isCorrect":false},{"id":"b","text":"Safe state","isCorrect":true},{"id":"c","text":"Critical state","isCorrect":false},{"id":"d","text":"Race state","isCorrect":false}]'::jsonb,
    '[]'::jsonb,
    'A safe state has at least one safe sequence that allows every process to finish.',
    '{}'::jsonb
  ),
  (
    'OS',
    'Memory Management',
    'Paging',
    'short_text',
    'What page replacement algorithm replaces the page that will not be used for the longest time in the future?',
    '[]'::jsonb,
    '["optimal","optimal page replacement","opt"]'::jsonb,
    'The optimal page replacement algorithm uses future knowledge and is mainly a theoretical benchmark.',
    '{}'::jsonb
  );

insert into questions (subject, topic, subtopic, type, prompt, options, accepted_answers, explanation, metadata)
values
  (
    'DBMS',
    'Relational Model',
    'Normalization',
    'mcq',
    'Which normal form removes partial dependency on a composite key?',
    '[{"id":"a","text":"1NF","isCorrect":false},{"id":"b","text":"2NF","isCorrect":true},{"id":"c","text":"3NF","isCorrect":false},{"id":"d","text":"BCNF","isCorrect":false}]'::jsonb,
    '[]'::jsonb,
    'Second Normal Form eliminates partial dependencies on candidate keys.',
    '{}'::jsonb
  ),
  (
    'DBMS',
    'Relational Model',
    'Normalization',
    'short_text',
    'The process of reducing redundancy by decomposing tables is called what?',
    '[]'::jsonb,
    '["normalization"]'::jsonb,
    'Normalization organizes attributes and relations to reduce anomalies and redundancy.',
    '{}'::jsonb
  ),
  (
    'DBMS',
    'Relational Model',
    'Normalization',
    'mcq',
    'A relation is in BCNF if for every non-trivial functional dependency X -> Y, X is a what?',
    '[{"id":"a","text":"Prime attribute","isCorrect":false},{"id":"b","text":"Superkey","isCorrect":true},{"id":"c","text":"Foreign key","isCorrect":false},{"id":"d","text":"Minimal cover","isCorrect":false}]'::jsonb,
    '[]'::jsonb,
    'BCNF requires the determinant in every non-trivial functional dependency to be a superkey.',
    '{}'::jsonb
  ),
  (
    'DBMS',
    'Transaction Management',
    'ACID',
    'mcq',
    'Which ACID property ensures that a transaction''s effects are permanent after commit?',
    '[{"id":"a","text":"Atomicity","isCorrect":false},{"id":"b","text":"Consistency","isCorrect":false},{"id":"c","text":"Isolation","isCorrect":false},{"id":"d","text":"Durability","isCorrect":true}]'::jsonb,
    '[]'::jsonb,
    'Durability ensures committed changes survive crashes and power loss.',
    '{}'::jsonb
  ),
  (
    'DBMS',
    'Transaction Management',
    'ACID',
    'short_text',
    'What ACID property guarantees that either all operations of a transaction happen or none do?',
    '[]'::jsonb,
    '["atomicity"]'::jsonb,
    'Atomicity treats the transaction as an indivisible unit.',
    '{}'::jsonb
  ),
  (
    'DBMS',
    'Transaction Management',
    'ACID',
    'mcq',
    'Dirty reads become possible when which isolation problem is present?',
    '[{"id":"a","text":"Reading uncommitted data","isCorrect":true},{"id":"b","text":"Lost update","isCorrect":false},{"id":"c","text":"Phantom read","isCorrect":false},{"id":"d","text":"Write skew","isCorrect":false}]'::jsonb,
    '[]'::jsonb,
    'A dirty read means one transaction reads another transaction''s uncommitted data.',
    '{}'::jsonb
  ),
  (
    'DBMS',
    'Indexing',
    'B+ Trees',
    'mcq',
    'In a B+ tree, actual record pointers are typically stored in which nodes?',
    '[{"id":"a","text":"Only internal nodes","isCorrect":false},{"id":"b","text":"Only leaf nodes","isCorrect":true},{"id":"c","text":"Root node only","isCorrect":false},{"id":"d","text":"All nodes equally","isCorrect":false}]'::jsonb,
    '[]'::jsonb,
    'B+ trees keep search keys in internal nodes and record pointers at the leaves.',
    '{}'::jsonb
  ),
  (
    'DBMS',
    'Indexing',
    'B+ Trees',
    'short_text',
    'What linked structure between leaf nodes makes range queries efficient in a B+ tree?',
    '[]'::jsonb,
    '["leaf level linked list","linked list","linked leaves"]'::jsonb,
    'Leaf nodes are linked in order, allowing fast sequential traversal for ranges.',
    '{}'::jsonb
  ),
  (
    'DBMS',
    'Indexing',
    'B+ Trees',
    'mcq',
    'Increasing the branching factor of a balanced tree index usually does what to its height?',
    '[{"id":"a","text":"Increases height","isCorrect":false},{"id":"b","text":"Decreases height","isCorrect":true},{"id":"c","text":"Makes height random","isCorrect":false},{"id":"d","text":"Has no effect","isCorrect":false}]'::jsonb,
    '[]'::jsonb,
    'Higher branching factors let more keys fit per node, reducing the number of levels.',
    '{}'::jsonb
  ),
  (
    'DBMS',
    'Concurrency Control',
    'Locking',
    'mcq',
    'Which lock allows multiple transactions to read the same item simultaneously?',
    '[{"id":"a","text":"Exclusive lock","isCorrect":false},{"id":"b","text":"Shared lock","isCorrect":true},{"id":"c","text":"Intent exclusive lock","isCorrect":false},{"id":"d","text":"Update lock","isCorrect":false}]'::jsonb,
    '[]'::jsonb,
    'Shared locks permit concurrent reads but block conflicting writes.',
    '{}'::jsonb
  ),
  (
    'DBMS',
    'Concurrency Control',
    'Locking',
    'short_text',
    'Which protocol guarantees conflict serializability by requiring growing and shrinking phases?',
    '[]'::jsonb,
    '["two phase locking","2pl"]'::jsonb,
    'Two-phase locking separates lock acquisition from lock release.',
    '{}'::jsonb
  ),
  (
    'DBMS',
    'Concurrency Control',
    'Locking',
    'mcq',
    'Strict two-phase locking mainly helps prevent which issue after a crash?',
    '[{"id":"a","text":"Cascading rollback","isCorrect":true},{"id":"b","text":"Full table scan","isCorrect":false},{"id":"c","text":"Duplicate indexes","isCorrect":false},{"id":"d","text":"Checkpointing","isCorrect":false}]'::jsonb,
    '[]'::jsonb,
    'By holding exclusive locks until commit or abort, strict 2PL avoids cascading rollbacks.',
    '{}'::jsonb
  ),
  (
    'DBMS',
    'Relational Model',
    'Normalization',
    'mcq',
    'Which normal form removes transitive dependency among non-key attributes?',
    '[{"id":"a","text":"2NF","isCorrect":false},{"id":"b","text":"3NF","isCorrect":true},{"id":"c","text":"BCNF","isCorrect":false},{"id":"d","text":"4NF","isCorrect":false}]'::jsonb,
    '[]'::jsonb,
    'Third Normal Form removes transitive dependencies on non-key attributes.',
    '{}'::jsonb
  ),
  (
    'DBMS',
    'Transaction Management',
    'ACID',
    'short_text',
    'What isolation anomaly occurs when a transaction reads a row twice and gets different values because another transaction committed an update in between?',
    '[]'::jsonb,
    '["non repeatable read","nonrepeatable read"]'::jsonb,
    'A non-repeatable read happens when the same row returns different committed values within one transaction.',
    '{}'::jsonb
  ),
  (
    'DBMS',
    'Indexing',
    'B+ Trees',
    'mcq',
    'Why are B+ trees widely used in databases instead of simple binary search trees?',
    '[{"id":"a","text":"They reduce disk I/O by keeping tree height small","isCorrect":true},{"id":"b","text":"They remove the need for indexes entirely","isCorrect":false},{"id":"c","text":"They never need rebalancing","isCorrect":false},{"id":"d","text":"They store only one key per node","isCorrect":false}]'::jsonb,
    '[]'::jsonb,
    'B+ trees have high fan-out, which keeps the tree shallow and disk access efficient.',
    '{}'::jsonb
  );

insert into questions (subject, topic, subtopic, type, prompt, options, accepted_answers, explanation, metadata)
values
  (
    'DSA',
    'Trees',
    'Binary Search Tree',
    'mcq',
    'In a binary search tree, where are keys smaller than a node''s key stored?',
    '[{"id":"a","text":"Left subtree","isCorrect":true},{"id":"b","text":"Right subtree","isCorrect":false},{"id":"c","text":"Only at leaves","isCorrect":false},{"id":"d","text":"In hash buckets","isCorrect":false}]'::jsonb,
    '[]'::jsonb,
    'BST ordering places smaller keys in the left subtree and larger keys in the right subtree.',
    '{}'::jsonb
  ),
  (
    'DSA',
    'Trees',
    'Binary Search Tree',
    'short_text',
    'What traversal of a binary search tree prints the keys in sorted order?',
    '[]'::jsonb,
    '["inorder","inorder traversal"]'::jsonb,
    'An inorder traversal visits left subtree, root, and right subtree in sorted order for a BST.',
    '{}'::jsonb
  ),
  (
    'DSA',
    'Trees',
    'Binary Search Tree',
    'mcq',
    'If a binary search tree becomes skewed, the worst-case search complexity becomes what?',
    '[{"id":"a","text":"O(1)","isCorrect":false},{"id":"b","text":"O(log n)","isCorrect":false},{"id":"c","text":"O(n)","isCorrect":true},{"id":"d","text":"O(n log n)","isCorrect":false}]'::jsonb,
    '[]'::jsonb,
    'A skewed BST behaves like a linked list, making search linear in the number of nodes.',
    '{}'::jsonb
  ),
  (
    'DSA',
    'Sorting',
    'Divide and Conquer',
    'mcq',
    'Which sorting algorithm has average-case time complexity O(n log n) and is stable in its standard linked-list-friendly form?',
    '[{"id":"a","text":"Selection sort","isCorrect":false},{"id":"b","text":"Merge sort","isCorrect":true},{"id":"c","text":"Bubble sort","isCorrect":false},{"id":"d","text":"Insertion sort","isCorrect":false}]'::jsonb,
    '[]'::jsonb,
    'Merge sort repeatedly divides and merges while preserving relative order of equal elements.',
    '{}'::jsonb
  ),
  (
    'DSA',
    'Sorting',
    'Divide and Conquer',
    'short_text',
    'What partition-based sorting algorithm chooses a pivot and recursively sorts two partitions?',
    '[]'::jsonb,
    '["quicksort","quick sort"]'::jsonb,
    'Quicksort partitions around a pivot, then recursively sorts the resulting segments.',
    '{}'::jsonb
  ),
  (
    'DSA',
    'Sorting',
    'Divide and Conquer',
    'mcq',
    'If quicksort repeatedly chooses the smallest element as pivot on an already sorted array, the worst-case time is what?',
    '[{"id":"a","text":"O(log n)","isCorrect":false},{"id":"b","text":"O(n)","isCorrect":false},{"id":"c","text":"O(n log n)","isCorrect":false},{"id":"d","text":"O(n^2)","isCorrect":true}]'::jsonb,
    '[]'::jsonb,
    'Bad pivots create highly unbalanced partitions, producing quadratic performance.',
    '{}'::jsonb
  ),
  (
    'DSA',
    'Graphs',
    'Traversal',
    'mcq',
    'Which graph traversal uses a queue in its standard implementation?',
    '[{"id":"a","text":"Depth First Search","isCorrect":false},{"id":"b","text":"Breadth First Search","isCorrect":true},{"id":"c","text":"Topological sort only","isCorrect":false},{"id":"d","text":"Union find","isCorrect":false}]'::jsonb,
    '[]'::jsonb,
    'Breadth First Search explores neighbors level by level using a queue.',
    '{}'::jsonb
  ),
  (
    'DSA',
    'Graphs',
    'Traversal',
    'short_text',
    'Which traversal is commonly used to detect cycles in an undirected graph by checking visited neighbors and parent links?',
    '[]'::jsonb,
    '["depth first search","dfs"]'::jsonb,
    'DFS naturally tracks recursion or stack paths, making cycle checks straightforward.',
    '{}'::jsonb
  ),
  (
    'DSA',
    'Graphs',
    'Traversal',
    'mcq',
    'For an unweighted graph, the shortest path from a source to all vertices is found by which traversal?',
    '[{"id":"a","text":"DFS","isCorrect":false},{"id":"b","text":"BFS","isCorrect":true},{"id":"c","text":"Prim","isCorrect":false},{"id":"d","text":"Kruskal","isCorrect":false}]'::jsonb,
    '[]'::jsonb,
    'BFS reaches vertices in increasing number of edges from the source in an unweighted graph.',
    '{}'::jsonb
  ),
  (
    'DSA',
    'Heaps',
    'Priority Queue',
    'mcq',
    'A binary heap is typically used to implement which abstract data type efficiently?',
    '[{"id":"a","text":"Priority queue","isCorrect":true},{"id":"b","text":"Trie","isCorrect":false},{"id":"c","text":"Suffix array","isCorrect":false},{"id":"d","text":"Hash join","isCorrect":false}]'::jsonb,
    '[]'::jsonb,
    'Binary heaps support efficient insertion and extraction of the highest or lowest priority element.',
    '{}'::jsonb
  ),
  (
    'DSA',
    'Heaps',
    'Priority Queue',
    'short_text',
    'What is the time complexity of inserting an element into a binary heap in the worst case?',
    '[]'::jsonb,
    '["o(log n)","log n"]'::jsonb,
    'Insertion may bubble the new element up through the height of the heap.',
    '{}'::jsonb
  ),
  (
    'DSA',
    'Heaps',
    'Priority Queue',
    'mcq',
    'In a max heap, the value stored at every parent node is how related to its children?',
    '[{"id":"a","text":"Smaller than both children","isCorrect":false},{"id":"b","text":"Equal to the left child only","isCorrect":false},{"id":"c","text":"Greater than or equal to both children","isCorrect":true},{"id":"d","text":"Unrelated to its children","isCorrect":false}]'::jsonb,
    '[]'::jsonb,
    'The heap property in a max heap keeps each parent at least as large as its children.',
    '{}'::jsonb
  ),
  (
    'DSA',
    'Trees',
    'Binary Search Tree',
    'short_text',
    'Which node in a binary search tree has no children?',
    '[]'::jsonb,
    '["leaf","leaf node"]'::jsonb,
    'A leaf node is a node with no children.',
    '{}'::jsonb
  ),
  (
    'DSA',
    'Sorting',
    'Divide and Conquer',
    'mcq',
    'Merge sort follows which general design strategy?',
    '[{"id":"a","text":"Greedy","isCorrect":false},{"id":"b","text":"Dynamic programming","isCorrect":false},{"id":"c","text":"Divide and conquer","isCorrect":true},{"id":"d","text":"Backtracking","isCorrect":false}]'::jsonb,
    '[]'::jsonb,
    'Merge sort splits the array into smaller parts, solves them recursively, and combines the results.',
    '{}'::jsonb
  ),
  (
    'DSA',
    'Graphs',
    'Traversal',
    'short_text',
    'Which traversal explores graph vertices level by level?',
    '[]'::jsonb,
    '["breadth first search","bfs"]'::jsonb,
    'Breadth First Search processes vertices in increasing distance from the source.',
    '{}'::jsonb
  );
