/**
 * Neural Learner Model - Brain-Inspired Progression System 3.0
 * 
 * A biologically-inspired neural network model for adaptive mathematics learning.
 * 
 * Architecture:
 * - Input Layer: 24 sensor neurons
 * - Hidden Layer: 12 integration neurons  
 * - Output Layer: 8 action neurons
 * 
 * Learning Mechanisms:
 * - Hebbian Learning: "Neurons that fire together, wire together"
 * - STDP: Spike-Timing-Dependent Plasticity
 * - Homeostatic Plasticity: Self-stabilization
 * - Synaptic Consolidation: Memory formation
 * 
 * Scientific Foundation:
 * - Neuroscience: Synaptic plasticity, neural networks
 * - Cognitive Psychology: Working memory, cognitive load
 * - Mathematics Education: ZPD, scaffolding, embodied cognition
 */

import type { LearningProgression } from "../shared/schema";

// ===== ACTIVATION FUNCTIONS =====

export class ActivationFunctions {
  /**
   * Sigmoid: Maps input to (0, 1)
   * Used for: Binary signals, probabilities
   */
  static sigmoid(x: number): number {
    return 1 / (1 + Math.exp(-x));
  }

  static sigmoidDerivative(x: number): number {
    const s = this.sigmoid(x);
    return s * (1 - s);
  }

  /**
   * Tanh: Maps input to (-1, 1)
   * Used for: Bipolar signals, centered data
   */
  static tanh(x: number): number {
    return Math.tanh(x);
  }

  static tanhDerivative(x: number): number {
    const t = Math.tanh(x);
    return 1 - t * t;
  }

  /**
   * ReLU: Rectified Linear Unit
   * Used for: Positive reinforcement, hidden layers
   */
  static relu(x: number): number {
    return Math.max(0, x);
  }

  static reluDerivative(x: number): number {
    return x > 0 ? 1 : 0;
  }

  /**
   * LeakyReLU: Allows small negative values
   * Used for: Avoiding dead neurons
   */
  static leakyRelu(x: number, alpha: number = 0.01): number {
    return x > 0 ? x : alpha * x;
  }

  static leakyReluDerivative(x: number, alpha: number = 0.01): number {
    return x > 0 ? 1 : alpha;
  }

  /**
   * Softmax: Normalizes to probability distribution
   * Used for: Competing options, strategy selection
   */
  static softmax(values: number[]): number[] {
    const max = Math.max(...values);
    const exps = values.map(v => Math.exp(v - max)); // Numerical stability
    const sum = exps.reduce((a, b) => a + b, 0);
    return exps.map(e => e / sum);
  }
}

// ===== NEURON TYPES =====

export type NeuronType = 'input' | 'hidden' | 'output';
export type ActivationType = 'sigmoid' | 'tanh' | 'relu' | 'leaky_relu' | 'linear';

export interface Neuron {
  id: string;
  type: NeuronType;
  layer: 'input' | 'hidden' | 'output';

  // Current state
  activation: number; // 0.0-1.0
  rawInput: number; // Before activation function
  bias: number; // Learnable bias term

  // Activation function
  activationType: ActivationType;

  // Metadata
  name: string;
  description: string;
  cluster?: string; // e.g., "performance", "strategy", "emotional"
}

export interface Connection {
  id: string;
  fromNeuronId: string;
  toNeuronId: string;

  // Synaptic strength
  weight: number; // Can be positive (excitatory) or negative (inhibitory)

  // Learning parameters
  learningRate: number; // How fast this connection adapts
  momentum: number; // Previous weight change (for smoother updates)

  // Plasticity metadata
  lastActivationTime: number; // For STDP
  activationCount: number; // How often used
  consolidationStrength: number; // Long-term memory strength

  // Connection type
  type: 'excitatory' | 'inhibitory' | 'modulatory';
}

// ===== NETWORK STATE =====

export interface NetworkState {
  neurons: Map<string, Neuron>;
  connections: Connection[];

  // Global parameters
  globalLearningRate: number;
  homeostasisTarget: number; // Target average activation
  temperature: number; // For exploration vs exploitation

  // Performance tracking
  totalUpdates: number;
  lastUpdateTime: Date;
  predictionAccuracy: number;
}

// ===== INPUT/OUTPUT VECTORS =====

export interface InputVector {
  // Performance Cluster (6 neurons)
  N_correct: number;
  N_speed: number;
  N_accuracy_trend: number;
  N_consistency: number;
  N_near_miss: number;
  N_first_attempt: number;

  // Strategy Cluster (5 neurons)
  N_counting: number;
  N_decomposition: number;
  N_place_value: number;
  N_retrieval: number;
  N_strategy_flexibility: number;

  // Metacognitive Cluster (4 neurons)
  N_self_correction: number;
  N_help_seeking: number;
  N_confidence: number;
  N_reflection: number;

  // Emotional Cluster (5 neurons)
  N_frustration: number;
  N_engagement: number;
  N_motivation: number;
  N_anxiety: number;
  N_flow: number;

  // Context Cluster (4 neurons)
  N_time_of_day: number;
  N_session_length: number;
  N_days_since_last: number;
  N_cumulative_fatigue: number;

  // Dornheim: Prerequisite Skills Cluster (4 neurons)
  N_subitizing_ability: number;
  N_comparison_ability: number;
  N_seriation_ability: number;
  N_rapid_naming_speed: number;

  // Wittmann & Gaidoschik Cluster (2 neurons)
  N_doubling: number;           // 🎯 Verdopplungsfähigkeit (6+6, 7+7)
  N_core_tasks: number;         // 🌟 KERNAUFGABEN-Beherrschung (Wittmann: Basis für Herleiten)
  N_derivation: number;         // 🔄 HERLEITEN-Fähigkeit (Gaidoschik: Von Kernaufgaben ableiten)
}

export interface OutputVector {
  A_task_difficulty: number; // 0.0-1.0
  A_scaffold_visual: number; // 0.0-1.0
  A_scaffold_strategic: number; // 0.0-1.0
  A_pacing: number; // 0.0-1.0
  A_feedback_depth: number; // 0.0-1.0
  A_encouragement: number; // 0.0-1.0
  A_break_suggestion: number; // 0.0-1.0
  A_challenge_boost: number; // 0.0-1.0
}

// ===== MAIN NEURAL NETWORK CLASS =====

export class NeuralLearnerModel {
  private state: NetworkState;

  constructor(initialState?: Partial<NetworkState>) {
    this.state = {
      neurons: new Map(),
      connections: [],
      globalLearningRate: 0.01,
      homeostasisTarget: 0.15, // 15% of neurons active on average
      temperature: 1.0,
      totalUpdates: 0,
      lastUpdateTime: new Date(),
      predictionAccuracy: 0.5,
      ...initialState
    };

    this.initializeNeurons();
    this.initializeConnections();
  }

  /**
   * Initialize all 44 neurons (24 input + 12 hidden + 8 output)
   */
  private initializeNeurons(): void {
    // === INPUT LAYER (24 neurons) ===

    // Performance Cluster (6)
    this.addNeuron('N_correct', 'input', 'sigmoid', 'performance', 
      'Correctness signal (0=wrong, 1=correct)');
    this.addNeuron('N_speed', 'input', 'sigmoid', 'performance', 
      'Speed signal (normalized response time)');
    this.addNeuron('N_accuracy_trend', 'input', 'tanh', 'performance', 
      'Accuracy trend (improving/declining)');
    this.addNeuron('N_consistency', 'input', 'sigmoid', 'performance', 
      'Consistency over last 5 tasks');
    this.addNeuron('N_near_miss', 'input', 'sigmoid', 'performance', 
      'Almost correct signal');
    this.addNeuron('N_first_attempt', 'input', 'sigmoid', 'performance', 
      'Success on first attempt');

    // Strategy Cluster (5)
    this.addNeuron('N_counting', 'input', 'sigmoid', 'strategy', 
      'Counting strategy activation');
    this.addNeuron('N_decomposition', 'input', 'sigmoid', 'strategy', 
      'Decomposition strategy activation');
    this.addNeuron('N_place_value', 'input', 'sigmoid', 'strategy', 
      'Place-value strategy activation');
    this.addNeuron('N_retrieval', 'input', 'sigmoid', 'strategy', 
      'Automatic retrieval activation');
    this.addNeuron('N_strategy_flexibility', 'input', 'sigmoid', 'strategy', 
      'Strategy switching rate');

    // Metacognitive Cluster (4)
    this.addNeuron('N_self_correction', 'input', 'sigmoid', 'metacognitive', 
      'Self-correction signal');
    this.addNeuron('N_help_seeking', 'input', 'sigmoid', 'metacognitive', 
      'Help request signal');
    this.addNeuron('N_confidence', 'input', 'sigmoid', 'metacognitive', 
      'Self-assessment confidence');
    this.addNeuron('N_reflection', 'input', 'sigmoid', 'metacognitive', 
      'Reflection time (pauses)');

    // Emotional Cluster (5)
    this.addNeuron('N_frustration', 'input', 'sigmoid', 'emotional', 
      'Frustration markers');
    this.addNeuron('N_engagement', 'input', 'sigmoid', 'emotional', 
      'Engagement level');
    this.addNeuron('N_motivation', 'input', 'sigmoid', 'emotional', 
      'Motivation signal');
    this.addNeuron('N_anxiety', 'input', 'sigmoid', 'emotional', 
      'Anxiety/stress indicator');
    this.addNeuron('N_flow', 'input', 'sigmoid', 'emotional', 
      'Flow state indicator');

    // Context Cluster (4)
    this.addNeuron('N_time_of_day', 'input', 'sigmoid', 'context', 
      'Time of day (fatigue effect)');
    this.addNeuron('N_session_length', 'input', 'sigmoid', 'context', 
      'Current session duration');
    this.addNeuron('N_days_since_last', 'input', 'sigmoid', 'context', 
      'Days since last session');
    this.addNeuron('N_cumulative_fatigue', 'input', 'sigmoid', 'context', 
      'Fatigue accumulation');

    // Dornheim: Prerequisite Skills Cluster (4)
    this.addNeuron('N_subitizing_ability', 'input', 'sigmoid', 'prerequisite', 
      'Simultaneous quantity recognition (Dornheim 2008)');
    this.addNeuron('N_comparison_ability', 'input', 'sigmoid', 'prerequisite', 
      'Quantity comparison without calculation');
    this.addNeuron('N_seriation_ability', 'input', 'sigmoid', 'prerequisite', 
      'Number ordering and seriation');
    this.addNeuron('N_rapid_naming_speed', 'input', 'sigmoid', 'prerequisite', 
      'RAN - processing speed indicator');

    // Wittmann & Gaidoschik Cluster (3 neurons)
    this.addNeuron('N_doubling', 'input', 'sigmoid', 'wittmann_gaidoschik', 
      'Doubling skill (e.g., 6+6, 7+7)');
    this.addNeuron('N_core_tasks', 'input', 'sigmoid', 'wittmann_gaidoschik', 
      'Mastery of core tasks (Wittmann: basis for derivation)');
    this.addNeuron('N_derivation', 'input', 'sigmoid', 'wittmann_gaidoschik', 
      'Derivation skill (Gaidoschik: deriving from core tasks)');

    // Rechengesetze Cluster (3 neurons - NEUE INTEGRATION!)
    this.addNeuron('N_commutative_law', 'input', 'sigmoid', 'rechengesetze', 
      'Kommutativgesetz: Tauschaufgaben nutzen (3+7 = 7+3)');
    this.addNeuron('N_associative_law', 'input', 'sigmoid', 'rechengesetze', 
      'Assoziativgesetz: Geschicktes Gruppieren (8+7+2 = 8+2+7 = 10+7)');
    this.addNeuron('N_distributive_law', 'input', 'sigmoid', 'rechengesetze', 
      'Distributivgesetz (Vorstufe): Zerlegen (8+7 = 8+2+5, später 7×9=7×10-7×1)');

    // === HIDDEN LAYER (12 neurons) ===

    // Cognitive Processor (4)
    this.addNeuron('H_cognitive_load', 'hidden', 'tanh', 'cognitive', 
      'Integrated cognitive load');
    this.addNeuron('H_working_memory', 'hidden', 'tanh', 'cognitive', 
      'Working memory capacity');
    this.addNeuron('H_conceptual_depth', 'hidden', 'tanh', 'cognitive', 
      'Conceptual understanding');
    this.addNeuron('H_procedural_fluency', 'hidden', 'tanh', 'cognitive', 
      'Procedural fluency');

    // Metacognitive Monitor (4)
    this.addNeuron('H_self_awareness', 'hidden', 'tanh', 'metacognitive', 
      'Metacognitive awareness');
    this.addNeuron('H_strategy_selection', 'hidden', 'tanh', 'metacognitive', 
      'Strategy selection quality');
    this.addNeuron('H_error_detection', 'hidden', 'tanh', 'metacognitive', 
      'Error detection ability');
    this.addNeuron('H_learning_control', 'hidden', 'tanh', 'metacognitive', 
      'Self-regulation strength');

    // Emotional Regulator (4)
    this.addNeuron('H_emotion_regulation', 'hidden', 'tanh', 'emotional', 
      'Emotional regulation');
    this.addNeuron('H_resilience', 'hidden', 'tanh', 'emotional', 
      'Resilience after errors');
    this.addNeuron('H_intrinsic_motivation', 'hidden', 'tanh', 'emotional', 
      'Intrinsic motivation');
    this.addNeuron('H_growth_mindset', 'hidden', 'tanh', 'emotional', 
      'Growth mindset indicator');

    // === OUTPUT LAYER (8 neurons) ===

    this.addNeuron('A_task_difficulty', 'output', 'sigmoid', 'action', 
      'Task difficulty level');
    this.addNeuron('A_scaffold_visual', 'output', 'sigmoid', 'action', 
      'Visual scaffolding amount');
    this.addNeuron('A_scaffold_strategic', 'output', 'sigmoid', 'action', 
      'Strategic hints amount');
    this.addNeuron('A_pacing', 'output', 'sigmoid', 'action', 
      'Tempo adjustment');
    this.addNeuron('A_feedback_depth', 'output', 'sigmoid', 'action', 
      'Feedback detail level');
    this.addNeuron('A_encouragement', 'output', 'sigmoid', 'action', 
      'Encouragement level');
    this.addNeuron('A_break_suggestion', 'output', 'sigmoid', 'action', 
      'Break recommendation');
    this.addNeuron('A_challenge_boost', 'output', 'sigmoid', 'action', 
      'Challenge increase');
  }

  private addNeuron(
    id: string, 
    layer: 'input' | 'hidden' | 'output',
    activationType: ActivationType,
    cluster: string,
    description: string
  ): void {
    const neuron: Neuron = {
      id,
      type: layer,
      layer,
      activation: 0.0,
      rawInput: 0.0,
      bias: this.randomBias(),
      activationType,
      name: id,
      description,
      cluster
    };

    this.state.neurons.set(id, neuron);
  }

  /**
   * Initialize connections with biologically-inspired weights
   */
  private initializeConnections(): void {
    // INPUT → HIDDEN connections
    this.connectLayerToLayer('input', 'hidden');

    // HIDDEN → OUTPUT connections
    this.connectLayerToLayer('hidden', 'output');

    // Special connections (biologically motivated)
    this.addSpecialConnections();
  }

  private connectLayerToLayer(fromLayer: string, toLayer: string): void {
    const fromNeurons = Array.from(this.state.neurons.values())
      .filter(n => n.layer === fromLayer);
    const toNeurons = Array.from(this.state.neurons.values())
      .filter(n => n.layer === toLayer);

    for (const from of fromNeurons) {
      for (const to of toNeurons) {
        // Smart initialization based on neuron clusters
        const weight = this.initializeWeight(from, to);
        const connectionType = weight > 0 ? 'excitatory' : 'inhibitory';

        this.state.connections.push({
          id: `${from.id}_to_${to.id}`,
          fromNeuronId: from.id,
          toNeuronId: to.id,
          weight,
          learningRate: 0.01,
          momentum: 0.0,
          lastActivationTime: 0,
          activationCount: 0,
          consolidationStrength: 0.1,
          type: connectionType
        });
      }
    }
  }

  /**
   * Initialize weights based on neuron semantics
   * (Biology: Related neurons tend to have stronger connections)
   */
  private initializeWeight(from: Neuron, to: Neuron): number {
    // Base random weight (Xavier initialization)
    const fanIn = this.countIncomingConnections(to.id);
    const fanOut = this.countOutgoingConnections(from.id);
    const limit = Math.sqrt(6 / (fanIn + fanOut));
    let weight = (Math.random() * 2 - 1) * limit;

    // Semantic boosting based on neuron clusters
    if (from.cluster === to.cluster) {
      weight *= 1.5; // Same cluster = stronger connection
    }

    // Specific biologically-motivated connections
    if (from.id === 'N_frustration' && to.id === 'H_emotion_regulation') {
      weight = 0.8; // Strong positive (frustration activates regulation)
    }
    if (from.id === 'N_correct' && to.id === 'H_cognitive_load') {
      weight = -0.4; // Inhibitory (success reduces perceived load)
    }
    if (from.id === 'N_strategy_flexibility' && to.id === 'H_self_awareness') {
      weight = 0.6; // Excitatory (flexibility indicates awareness)
    }
    // New connections for Wittmann/Gaidoschik
    if (from.id === 'N_core_tasks' && to.id === 'N_derivation') {
      weight = 0.7; // Core tasks enable derivation
    }
    if (from.id === 'N_derivation' && to.id === 'H_conceptual_depth') {
      weight = 0.5; // Derivation improves conceptual understanding
    }
    if (from.id === 'N_core_tasks' && to.id === 'H_procedural_fluency') {
      weight = 0.4; // Core tasks build procedural fluency
    }
    if (from.id === 'N_doubling' && to.id === 'H_working_memory') {
        weight = 0.6; // Doubling skill utilizes working memory
    }


    return weight;
  }

  /**
   * Add special cross-layer connections (like cortical feedback)
   */
  private addSpecialConnections(): void {
    // Lateral inhibition within strategy cluster (competition)
    const strategyNeurons = ['N_counting', 'N_decomposition', 'N_place_value', 'N_retrieval'];

    for (let i = 0; i < strategyNeurons.length; i++) {
      for (let j = 0; j < strategyNeurons.length; j++) {
        if (i !== j) {
          // Strategies inhibit each other
          this.state.connections.push({
            id: `lateral_${strategyNeurons[i]}_${strategyNeurons[j]}`,
            fromNeuronId: strategyNeurons[i],
            toNeuronId: strategyNeurons[j],
            weight: -0.3, // Inhibitory
            learningRate: 0.005, // Slower learning for lateral connections
            momentum: 0.0,
            lastActivationTime: 0,
            activationCount: 0,
            consolidationStrength: 0.5,
            type: 'inhibitory'
          });
        }
      }
    }
    // Add connections related to the new Wittmann/Gaidoschik neurons
    this.addWittmannGaidoschikConnections();
  }

  private addWittmannGaidoschikConnections(): void {
    // Input to Hidden
    this.connectNeurons('N_core_tasks', 'H_conceptual_depth', 0.5, 'excitatory');
    this.connectNeurons('N_derivation', 'H_conceptual_depth', 0.5, 'excitatory');
    this.connectNeurons('N_core_tasks', 'H_procedural_fluency', 0.4, 'excitatory');
    this.connectNeurons('N_doubling', 'H_working_memory', 0.6, 'excitatory');
    this.connectNeurons('N_derivation', 'H_strategy_selection', 0.3, 'excitatory'); // Derivation can be a strategic choice

    // Hidden to Output
    this.connectNeurons('H_conceptual_depth', 'A_task_difficulty', 0.3, 'excitatory'); // Deeper understanding might lead to more complex tasks
    this.connectNeurons('H_procedural_fluency', 'A_task_difficulty', 0.2, 'excitatory');
    this.connectNeurons('H_conceptual_depth', 'A_scaffold_strategic', -0.2, 'inhibitory'); // Good understanding needs less strategic scaffolding
    this.connectNeurons('H_strategy_selection', 'A_scaffold_strategic', 0.4, 'excitatory'); // Good strategy selection needs more scaffolding for complex tasks

    // Input to Output (direct pathways)
    this.connectNeurons('N_core_tasks', 'A_task_difficulty', 0.2, 'excitatory');
    this.connectNeurons('N_derivation', 'A_task_difficulty', 0.3, 'excitatory');
    this.connectNeurons('N_derivation', 'A_scaffold_strategic', 0.2, 'excitatory'); // Help derive if needed

    // NEUE VERBINDUNGEN: Rechengesetze
    this.addRechengesetzeConnections();
  }

  private addRechengesetzeConnections(): void {
    // Kommutativgesetz → Strategische Flexibilität
    this.connectNeurons('N_commutative_law', 'H_strategy_selection', 0.5, 'excitatory');
    this.connectNeurons('N_commutative_law', 'H_conceptual_depth', 0.4, 'excitatory');
    
    // Assoziativgesetz → Konzeptverständnis (sehr wichtig!)
    this.connectNeurons('N_associative_law', 'H_conceptual_depth', 0.7, 'excitatory');
    this.connectNeurons('N_associative_law', 'H_strategy_selection', 0.6, 'excitatory');
    this.connectNeurons('N_associative_law', 'H_working_memory', -0.3, 'inhibitory'); // Reduziert kognitive Last
    
    // Distributivgesetz → Prozedurales Wissen (Basis für Multiplikation)
    this.connectNeurons('N_distributive_law', 'H_procedural_fluency', 0.5, 'excitatory');
    this.connectNeurons('N_distributive_law', 'H_conceptual_depth', 0.6, 'excitatory');
    
    // Rechengesetze → Aufgabenschwierigkeit
    this.connectNeurons('N_associative_law', 'A_task_difficulty', 0.4, 'excitatory'); // Assoziativ = fortgeschritten
    this.connectNeurons('N_distributive_law', 'A_task_difficulty', 0.3, 'excitatory');
    
    // Rechengesetze → Scaffolding (weniger Hilfe nötig)
    this.connectNeurons('N_associative_law', 'A_scaffold_strategic', -0.3, 'inhibitory');
    this.connectNeurons('N_commutative_law', 'A_scaffold_strategic', -0.2, 'inhibitory');
  }

  private connectNeurons(
    fromNeuronId: string,
    toNeuronId: string,
    weight: number,
    type: 'excitatory' | 'inhibitory' | 'modulatory'
  ): void {
    this.state.connections.push({
      id: `${fromNeuronId}_to_${toNeuronId}`,
      fromNeuronId,
      toNeuronId,
      weight,
      learningRate: 0.01,
      momentum: 0.0,
      lastActivationTime: 0,
      activationCount: 0,
      consolidationStrength: 0.1,
      type
    });
  }

  /**
   * FORWARD PASS: Propagate activations through network
   */
  forward(input: InputVector): OutputVector {
    // 1. Set input layer activations
    this.setInputActivations(input);

    // 2. Propagate to hidden layer
    this.propagateLayer('input', 'hidden');

    // 3. Propagate to output layer
    this.propagateLayer('hidden', 'output');

    // 4. Extract output vector
    return this.extractOutputVector();
  }

  private setInputActivations(input: InputVector): void {
    for (const [key, value] of Object.entries(input)) {
      const neuron = this.state.neurons.get(key);
      if (neuron) {
        neuron.rawInput = value;
        neuron.activation = this.activate(value, neuron.activationType);
      }
    }
  }

  private propagateLayer(fromLayer: string, toLayer: string): void {
    const toNeurons = Array.from(this.state.neurons.values())
      .filter(n => n.layer === toLayer);

    for (const toNeuron of toNeurons) {
      // Sum weighted inputs
      let weightedSum = toNeuron.bias;

      const incomingConnections = this.state.connections.filter(
        c => c.toNeuronId === toNeuron.id
      );

      for (const conn of incomingConnections) {
        const fromNeuron = this.state.neurons.get(conn.fromNeuronId);
        if (fromNeuron) {
          weightedSum += conn.weight * fromNeuron.activation;
        }
      }

      // Apply activation function
      toNeuron.rawInput = weightedSum;
      toNeuron.activation = this.activate(weightedSum, toNeuron.activationType);
    }
  }

  private activate(x: number, type: ActivationType): number {
    switch (type) {
      case 'sigmoid': return ActivationFunctions.sigmoid(x);
      case 'tanh': return ActivationFunctions.tanh(x);
      case 'relu': return ActivationFunctions.relu(x);
      case 'leaky_relu': return ActivationFunctions.leakyRelu(x);
      case 'linear': return x;
      default: return ActivationFunctions.sigmoid(x);
    }
  }

  private extractOutputVector(): OutputVector {
    return {
      A_task_difficulty: this.state.neurons.get('A_task_difficulty')?.activation ?? 0.5,
      A_scaffold_visual: this.state.neurons.get('A_scaffold_visual')?.activation ?? 0.5,
      A_scaffold_strategic: this.state.neurons.get('A_scaffold_strategic')?.activation ?? 0.5,
      A_pacing: this.state.neurons.get('A_pacing')?.activation ?? 0.5,
      A_feedback_depth: this.state.neurons.get('A_feedback_depth')?.activation ?? 0.5,
      A_encouragement: this.state.neurons.get('A_encouragement')?.activation ?? 0.5,
      A_break_suggestion: this.state.neurons.get('A_break_suggestion')?.activation ?? 0.0,
      A_challenge_boost: this.state.neurons.get('A_challenge_boost')?.activation ?? 0.0,
    };
  }

  /**
   * HEBBIAN LEARNING: "Neurons that fire together, wire together"
   */
  hebbianUpdate(preActivation: number, postActivation: number, connection: Connection): void {
    // Δw = η * pre * post * (1 - w)
    // The (1 - w) term bounds the weight to prevent infinite growth

    const delta = connection.learningRate * preActivation * postActivation * (1 - Math.abs(connection.weight));

    connection.weight += delta;
    connection.activationCount++;
  }

  /**
   * STDP: Spike-Timing-Dependent Plasticity
   * Timing matters: Pre-before-post strengthens, post-before-pre weakens
   */
  stdpUpdate(connection: Connection, preTime: number, postTime: number): void {
    const timeDiff = postTime - preTime; // milliseconds

    // STDP window: ±100ms
    const tau = 20; // Time constant (ms)

    if (Math.abs(timeDiff) > 100) return; // Outside STDP window

    let delta = 0;
    if (timeDiff > 0) {
      // Pre before post → LTP (Long-Term Potentiation)
      delta = connection.learningRate * Math.exp(-timeDiff / tau);
    } else {
      // Post before pre → LTD (Long-Term Depression)
      delta = -connection.learningRate * Math.exp(timeDiff / tau);
    }

    connection.weight += delta;
    connection.weight = Math.max(-1, Math.min(1, connection.weight)); // Bound
  }

  /**
   * HOMEOSTATIC PLASTICITY: Maintain stable average activation
   */
  homeostaticRegulation(): void {
    const activations = Array.from(this.state.neurons.values())
      .filter(n => n.layer === 'hidden')
      .map(n => n.activation);

    const avgActivation = activations.reduce((a, b) => a + b, 0) / activations.length;

    // If too active → scale down all weights
    if (avgActivation > this.state.homeostasisTarget * 1.5) {
      this.scaleAllWeights(0.98);
    }

    // If too inactive → scale up all weights
    if (avgActivation < this.state.homeostasisTarget * 0.5) {
      this.scaleAllWeights(1.02);
    }
  }

  private scaleAllWeights(factor: number): void {
    for (const conn of this.state.connections) {
      conn.weight *= factor;
    }
  }

  /**
   * SYNAPTIC CONSOLIDATION: Transfer to long-term memory
   */
  consolidate(timeSinceLastSession: number): void {
    // Forgetting curve: retention = e^(-t/τ)
    const tau = 7 * 24 * 60 * 60 * 1000; // 7 days in ms
    const retention = Math.exp(-timeSinceLastSession / tau);

    for (const conn of this.state.connections) {
      if (conn.activationCount > 5) {
        // Frequently used → consolidate (increase strength)
        conn.consolidationStrength += 0.01;
        conn.consolidationStrength = Math.min(1.0, conn.consolidationStrength);
      } else {
        // Rarely used → decay
        conn.weight *= retention;
        conn.consolidationStrength *= retention;
      }

      // Reset activation count
      conn.activationCount = 0;
    }
  }

  // ===== HELPER METHODS =====

  private randomBias(): number {
    return (Math.random() * 0.2) - 0.1; // Small random bias [-0.1, 0.1]
  }

  private countIncomingConnections(neuronId: string): number {
    return this.state.connections.filter(c => c.toNeuronId === neuronId).length;
  }

  private countOutgoingConnections(neuronId: string): number {
    return this.state.connections.filter(c => c.fromNeuronId === neuronId).length;
  }

  /**
   * Save network state for persistence
   */
  saveState(): NetworkState {
    return JSON.parse(JSON.stringify({
      ...this.state,
      neurons: Array.from(this.state.neurons.entries())
    }));
  }

  /**
   * Load network state from storage
   */
  loadState(savedState: any): void {
    this.state = {
      ...savedState,
      neurons: new Map(savedState.neurons)
    };
  }

  /**
   * Get human-readable network summary
   */
  getSummary(): string {
    const activeNeurons = Array.from(this.state.neurons.values())
      .filter(n => n.activation > 0.5).length;

    const avgWeight = this.state.connections
      .reduce((sum, c) => sum + Math.abs(c.weight), 0) / this.state.connections.length;

    const strongConnections = this.state.connections
      .filter(c => Math.abs(c.weight) > 0.5).length;

    return `
Neural Network Summary:
- Neurons: ${this.state.neurons.size} (${activeNeurons} active)
- Connections: ${this.state.connections.length} (${strongConnections} strong)
- Avg Weight: ${avgWeight.toFixed(3)}
- Updates: ${this.state.totalUpdates}
- Accuracy: ${(this.state.predictionAccuracy * 100).toFixed(1)}%
    `.trim();
  }
}

// ===== EXPORT SINGLETON =====

export const neuralModel = new NeuralLearnerModel();