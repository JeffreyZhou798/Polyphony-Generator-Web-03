import type { INoteSequence } from '@magenta/music';
import type { MusicStyle } from '../../utils/constants';
import type { Rule, ValidationResult, RuleViolation } from './types';
import { VoiceRangeRule } from './voiceRangeRule';
import { HarmonyRule } from './harmonyRule';
import { VoiceLeadingRule } from './voiceLeadingRule';
import { ParallelFifthsRule } from './parallelFifthsRule';
import { ParallelOctavesRule } from './parallelOctavesRule';
import { VoiceCrossingRule } from './voiceCrossingRule';

/**
 * 音乐规则引擎
 * 根据音乐风格动态应用不同的规则
 */
export class MusicRuleEngine {
  private rules: Rule[];

  constructor(style: MusicStyle = 'classical') {
    this.rules = this.loadRulesForStyle(style);
  }

  setStyle(style: MusicStyle): void {
    this.rules = this.loadRulesForStyle(style);
  }

  /**
   * 根据音乐风格加载相应的规则
   */
  private loadRulesForStyle(style: MusicStyle): Rule[] {
    const baseRules: Rule[] = [
      new VoiceRangeRule(),
      new VoiceLeadingRule()
    ];

    switch (style) {
      case 'classical':
        // 古典复调：严格遵循和声规则
        return [
          ...baseRules,
          new HarmonyRule(),
          new ParallelFifthsRule(),
          new ParallelOctavesRule(),
          new VoiceCrossingRule()
        ];

      case 'pop':
        // 流行音乐：允许更自由的声部进行
        return [
          ...baseRules,
          new HarmonyRule()
        ];

      case 'jazz':
        // 爵士音乐：最宽松，仅基本规则
        return [
          ...baseRules
        ];

      case 'modern':
        // 现代风格：中等严格度
        return [
          ...baseRules,
          new HarmonyRule(),
          new VoiceCrossingRule()
        ];

      default:
        return baseRules;
    }
  }

  /**
   * 验证序列是否符合所有规则
   */
  validate(sequence: INoteSequence): ValidationResult {
    const allViolations: RuleViolation[] = [];

    // 应用所有规则
    this.rules.forEach(rule => {
      const result = rule.check(sequence);
      allViolations.push(...result.violations);
    });

    // 分类违规
    const errors = allViolations.filter(v => v.severity === 'error');
    const warnings = allViolations.filter(v => v.severity === 'warning');

    return {
      valid: errors.length === 0,
      violations: allViolations,
      warnings,
      errors
    };
  }

  /**
   * 自动修正序列中的问题
   */
  fix(sequence: INoteSequence): INoteSequence {
    let fixedSequence = { ...sequence };

    this.rules.forEach(rule => {
      if (rule.canFix() && rule.fix) {
        fixedSequence = rule.fix(fixedSequence);
      }
    });

    return fixedSequence;
  }

  /**
   * 获取当前激活的规则描述
   */
  getRulesDescription(): string[] {
    return this.rules.map(rule => `${rule.name}: ${rule.description}`);
  }

  /**
   * 获取规则统计信息
   */
  getRulesStats(): { total: number; strict: number; moderate: number; loose: number } {
    return {
      total: this.rules.length,
      strict: this.rules.filter(r => r.strictness === 'strict').length,
      moderate: this.rules.filter(r => r.strictness === 'moderate').length,
      loose: this.rules.filter(r => r.strictness === 'loose').length
    };
  }
}

export const musicRuleEngine = new MusicRuleEngine();
