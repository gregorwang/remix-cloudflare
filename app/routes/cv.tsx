import type { LinksFunction, MetaFunction } from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";
import { useLoaderData, Link } from "@remix-run/react";
import { LazyMotion, domAnimation, m } from "framer-motion";
import { generateImageTokens } from "~/utils/imageToken.server";
import { pageMeta } from "~/utils/seo";

// ImageData type
interface ImageData {
  id: string | number;
  src: string;
  alt?: string;
}
// Icon components replaced with emoji for better performance
const CheckCircleIcon = ({ className }: { className?: string }) => (
  <span className={className} role="img" aria-label="check">✅</span>
);

const UserGroupIcon = ({ className }: { className?: string }) => (
  <span className={className} role="img" aria-label="users">👥</span>
);

const AcademicCapIcon = ({ className }: { className?: string }) => (
  <span className={className} role="img" aria-label="education">🎓</span>
);

const WrenchScrewdriverIcon = ({ className }: { className?: string }) => (
  <span className={className} role="img" aria-label="tools">🔧</span>
);

const TrophyIcon = ({ className }: { className?: string }) => (
  <span className={className} role="img" aria-label="trophy">🏆</span>
);

const HeartIcon = ({ className }: { className?: string }) => (
  <span className={className} role="img" aria-label="heart">❤️</span>
);

const UserIcon = ({ className }: { className?: string }) => (
  <span className={className} role="img" aria-label="user">👤</span>
);

const ChatBubbleLeftRightIcon = ({ className }: { className?: string }) => (
  <span className={className} role="img" aria-label="chat">💬</span>
);

const ClipboardDocumentListIcon = ({ className }: { className?: string }) => (
  <span className={className} role="img" aria-label="document">📋</span>
);

// Types
interface CVPageData {
  avatarImage: ImageData;
  content: {
    personal: {
      name: string;
      age: string;
      photo_alt: string;
      job_intention: string;
      expected_location: string;
    };
    work_experience: {
      title: string;
      tencent: {
        company: string;
        department: string;
        position: string;
        duration: string;
        description_1: string;
        responsibilities_1: {
          quality_check: string;
          complaint_review: string;
          violation_review: string;
          patrol_inspection: string;
        };
        description_2: string;
        responsibilities_2: {
          queue_management: string;
          daily_quality_check: string;
          rule_learning: string;
          ai_tools: string;
        };
      };
    };
    school_experience: {
      title: string;
      practice: {
        title: string;
        hospital: string;
        activities: {
          medical_learning: string;
          nursing_learning: string;
          patient_communication: string;
          meeting_participation: string;
        };
      };
    };
    education: {
      title: string;
      university: string;
      major: string;
    };
    skills: {
      title: string;
      list: {
        english: string;
        wps: string;
        office: string;
        driving: string;
        first_aid: string;
        chatgpt: string;
      };
      levels: {
        proficient: string;
        general: string;
      };
    };
    certificates: {
      title: string;
      cet6: string;
    };
    hobbies: {
      title: string;
      gaming: string;
      cycling: string;
      photography: string;
      music: string;
      anime: string;
      website: string;
    };
    self_evaluation: {
      title: string;
      content: string;
    };
  };
}

interface Skill {
  name: string;
  progress: number;
  level: string;
  icon: React.ComponentType<{ className?: string }>; // Icon component type
}

// Links function
export const links: LinksFunction = () => [
  { rel: "preload", as: "image", href: "Feedback/person.png" },
];

// Meta function
export const meta: MetaFunction = () => pageMeta.cv();

// Loader function - 在服务端生成头像token
export async function loader() {
  // 原始头像数据
  const rawAvatarImage = { id: 'cv-avatar', src: 'Feedback/person.webp', alt: '汪家俊的照片' };

  let avatarSrc = rawAvatarImage.src;
  try {
    const tokenResults = generateImageTokens([rawAvatarImage.src], 30);
    const tokenMap = new Map(tokenResults.map(result => [result.imageName, result.imageUrl]));
    avatarSrc = tokenMap.get(rawAvatarImage.src) || rawAvatarImage.src;
  } catch {
    avatarSrc = 'https://whylookthis.wangjiajun.asia/taobao.jfif';
  }

  const avatarImage = { ...rawAvatarImage, src: avatarSrc };

  const data: CVPageData = {
    avatarImage,
    content: {
      personal: {
        name: "汪家俊",
        age: "24岁",
        photo_alt: "汪家俊的照片",
        job_intention: "职业定位",
        expected_location: "期望地点：虾夷"
      },
      work_experience: {
        title: "冒险履历",
        tencent: {
          company: "交界地探险者协会",
          department: "大卢恩回收部·褪色者行动组",
          position: "资深褪色者战士",
          duration: "2023年7月 - 至今",
          description_1: "2023年7月，赐福引导返回交界地，开始追寻半神们持有的大卢恩碎片。",
          responsibilities_1: {
            quality_check: "调研持有大卢恩的半神领主（葛德瑞克、蕾娜菈等）情报",
            complaint_review: "跟随赐福之光指引，定位黄金树与遗迹位置",
            violation_review: "击败半神目标，回收大卢恩用于修复艾尔登法环",
            patrol_inspection: "探索宁姆格福、利耶尼亚等区域，清理腐败威胁"
          },
          description_2: "2024年1月，深入王城雷亚卢卡利亚，提升战斗技能与装备强化能力。",
          responsibilities_2: {
            queue_management: "在圆桌厅堂协助铁匠休格优化武器锻造流程",
            daily_quality_check: "执行高难度半神狩猎任务（拉达恩、玛莲妮亚等）",
            rule_learning: "掌握战技组合与流派搭配最佳实践",
            ai_tools: "运用ChatGPT、Claude等AI工具辅助敌人弱点分析与战术研究"
          }
        }
      },
      school_experience: {
        title: "修行经历",
        practice: {
          title: "实战修行",
          hospital: "西域禁地·机械研究所实习",
          activities: {
            medical_learning: "学习机械兽弱点分析，掌握扫描定位技能",
            nursing_learning: "跟随导师探索盖亚系统与环境修复技术",
            patient_communication: "与各部落建立联盟，协调资源与情报",
            meeting_participation: "参与远征规划，了解生态平衡维护体系，融合进去"
          }
        }
      },
      education: {
        title: "学院背景",
        university: "交界地魔法学院",
        major: "治疗医学 学士"
      },
      skills: {
        title: "技能树",
        list: {
          english: "古龙语言学·六阶",
          wps: "文档编织术",
          office: "办公自动化",
          driving: "机械操控·C2级",
          first_aid: "生命急救术",
          chatgpt: "AI协同·ChatGPT & Claude"
        },
        levels: {
          proficient: "精通",
          general: "熟悉"
        }
      },
      certificates: {
        title: "认证徽章",
        cet6: "古龙语言学·六阶认证"
      },
      hobbies: {
        title: "个人探索",
        gaming: "异世界冒险（总计1546h | 艾尔登法环100h白金 | 只狼无伤义父 | 羊蹄山之魂69小时白金 | 鸣潮214h）",
        cycling: "陆行探索",
        photography: "光影记录（214幅作品）",
        music: "旋律收集（2500+首 | FELT·Vivienne·mili）",
        anime: "次元观测（从零·火影·巨人·赤瞳·灵笼等11部）",
        website: "数字世界构筑（AI辅助开发）"
      },
      self_evaluation: {
        title: "褪色者宣言",
        content: "我是一个行走在现实与虚拟之间的探索者。善于运用AI工具（ChatGPT、Claude）解决实际问题，这个网站就是我用AI协同开发的作品。工作中追求品质与效率的平衡；生活中热爱游戏（1546小时冒险）、摄影（214幅光影）、音乐（2500+首收藏）、动漫（11部经典）。正如《艾尔登法环》中米凯拉所说——「将我的爱弃置于此」，我将所有热情与创造力都倾注在这片数字伊甸园中。"
      }
    }
  };

  return json(data, {
    headers: {
      "Cache-Control": "public, max-age=300", // token数据缓存5分钟
    },
  });
}

export default function CVPage() {
  const { avatarImage, content } = useLoaderData<typeof loader>();

  // 技能数据
  const skillsData: Skill[] = [
    { name: content.skills.list.english, progress: 85, level: content.skills.levels.proficient, icon: ChatBubbleLeftRightIcon },
    { name: content.skills.list.wps, progress: 90, level: content.skills.levels.proficient, icon: ClipboardDocumentListIcon },
    { name: content.skills.list.office, progress: 85, level: content.skills.levels.proficient, icon: ClipboardDocumentListIcon },
    { name: content.skills.list.driving, progress: 70, level: content.skills.levels.general, icon: UserIcon },
    { name: content.skills.list.first_aid, progress: 75, level: content.skills.levels.general, icon: HeartIcon },
    { name: content.skills.list.chatgpt, progress: 95, level: content.skills.levels.proficient, icon: WrenchScrewdriverIcon }
  ];

  return (
    <LazyMotion features={domAnimation}>
    <div className="min-h-screen bg-primary-50 font-sans">
      <div className="max-w-4xl mx-auto px-4 py-6 md:px-6 lg:px-8">
        
        {/* 页面标题和头像 */}
        <m.div
          className="bg-primary-100 rounded-lg shadow-xl p-6 md:p-8 mb-6"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8">
            {/* 头像 */}
            <m.div
              className="flex-shrink-0"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
            >
              <img
                src={avatarImage.src}
                alt={content.personal.photo_alt}
                onError={() => console.error('Image failed to load:', avatarImage.src)}
                className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover shadow-lg border-4 border-primary-50"
                loading="eager"
                decoding="async"
              />
            </m.div>

            {/* 基本信息 */}
            <div className="flex-1 text-center md:text-left">
              <m.h1
                className="text-4xl font-bold text-primary-950 leading-tight tracking-tight mb-1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
              >
                {content.personal.name}
              </m.h1>
              <m.p
                className="text-lg text-primary-950/70 leading-normal mb-3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.55, ease: [0.16, 1, 0.3, 1] }}
              >
                {content.personal.age}
              </m.p>
              <m.div
                className="flex flex-col md:flex-row gap-3 text-sm font-medium text-primary-950"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className="flex items-center justify-center md:justify-start gap-2">
                  <span className="text-base text-accent flex items-center justify-center">💼</span>
                  <span>{content.personal.job_intention}</span>
                </div>
                <div className="flex items-center justify-center md:justify-start gap-2">
                  <span className="text-base text-accent flex items-center justify-center">📍</span>
                  <span>{content.personal.expected_location}</span>
                </div>
              </m.div>
            </div>
          </div>
        </m.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* 左侧：工作经历和教育背景 */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* 工作经历 */}
            <m.div
              className="bg-primary-100 rounded-lg shadow-lg p-6"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.9, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                  <span className="text-xl text-accent flex items-center justify-center">💼</span>
                </div>
                <h2 className="text-2xl font-semibold leading-tight tracking-tight text-primary-950">{content.work_experience.title}</h2>
              </div>
              
              <div className="space-y-4">
                <div className="border-l-4 border-accent pl-4">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-2">
                    <div>
                      <h3 className="text-xl font-semibold leading-tight tracking-tight text-primary-950">{content.work_experience.tencent.company}</h3>
                      <p className="text-base text-accent font-medium leading-normal mt-0.5">{content.work_experience.tencent.position}</p>
                      <p className="text-sm text-primary-950/70 leading-normal">{content.work_experience.tencent.department}</p>
                    </div>
                    <span className="text-sm text-primary-950/70 leading-normal mt-1 md:mt-0">{content.work_experience.tencent.duration}</span>
                  </div>
                  
                  <div className="space-y-3 mt-3">
                    <div>
                      <p className="text-base text-primary-950 leading-relaxed mb-2">{content.work_experience.tencent.description_1}</p>
                      <ul className="space-y-1.5">
                        <li className="flex items-start gap-2">
                          <CheckCircleIcon className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-primary-950/70 leading-normal">{content.work_experience.tencent.responsibilities_1.quality_check}</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircleIcon className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-primary-950/70 leading-normal">{content.work_experience.tencent.responsibilities_1.complaint_review}</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircleIcon className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-primary-950/70 leading-normal">{content.work_experience.tencent.responsibilities_1.violation_review}</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircleIcon className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-primary-950/70 leading-normal">{content.work_experience.tencent.responsibilities_1.patrol_inspection}</span>
                        </li>
                      </ul>
                    </div>
                    
                    <div>
                      <p className="text-base text-primary-950 leading-relaxed mb-2">{content.work_experience.tencent.description_2}</p>
                      <ul className="space-y-1.5">
                        <li className="flex items-start gap-2">
                          <CheckCircleIcon className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-primary-950/70 leading-normal">{content.work_experience.tencent.responsibilities_2.queue_management}</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircleIcon className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-primary-950/70 leading-normal">{content.work_experience.tencent.responsibilities_2.daily_quality_check}</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircleIcon className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-primary-950/70 leading-normal">{content.work_experience.tencent.responsibilities_2.rule_learning}</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircleIcon className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-primary-950/70 leading-normal">{content.work_experience.tencent.responsibilities_2.ai_tools}</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </m.div>

            {/* 在校经历 */}
            <m.div
              className="bg-primary-100 rounded-lg shadow-lg p-6"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 1.05, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                  <UserGroupIcon className="text-xl text-accent" />
                </div>
                <h2 className="text-2xl font-semibold leading-tight tracking-tight text-primary-950">{content.school_experience.title}</h2>
              </div>
              
              <div className="border-l-4 border-accent pl-4">
                <h3 className="text-xl font-semibold leading-tight tracking-tight text-primary-950 mb-1">{content.school_experience.practice.title}</h3>
                <p className="text-base text-accent font-medium leading-normal mb-3">{content.school_experience.practice.hospital}</p>
                
                <ul className="space-y-1.5">
                  <li className="flex items-start gap-2">
                    <CheckCircleIcon className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-primary-950/70 leading-normal">{content.school_experience.practice.activities.medical_learning}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircleIcon className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-primary-950/70 leading-normal">{content.school_experience.practice.activities.nursing_learning}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircleIcon className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-primary-950/70 leading-normal">{content.school_experience.practice.activities.patient_communication}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircleIcon className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-primary-950/70 leading-normal">{content.school_experience.practice.activities.meeting_participation}</span>
                  </li>
                </ul>
              </div>
            </m.div>
          </div>

          {/* 右侧：技能、教育、证书等 */}
          <div className="space-y-6">
            
            {/* 教育背景 */}
            <m.div
              className="bg-primary-100 rounded-lg shadow-lg p-6"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 1.2, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                  <AcademicCapIcon className="text-xl text-accent" />
                </div>
                <h2 className="text-2xl font-semibold leading-tight tracking-tight text-primary-950">{content.education.title}</h2>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-xl font-semibold leading-tight tracking-tight text-primary-950">{content.education.university}</h3>
                <p className="text-base text-accent font-medium leading-normal">{content.education.major}</p>
              </div>
            </m.div>

            {/* 职业技能 */}
            <m.div
              className="bg-primary-100 rounded-lg shadow-lg p-6"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 1.35, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                  <WrenchScrewdriverIcon className="text-xl text-accent" />
                </div>
                <h2 className="text-2xl font-semibold leading-tight tracking-tight text-primary-950">{content.skills.title}</h2>
              </div>

              <div className="space-y-3">
                {skillsData.map((skill, index) => (
                  <m.div
                    key={skill.name}
                    className="space-y-1.5"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 1.45 + index * 0.05, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <skill.icon className="w-4 h-4 text-primary-950/70" />
                        <span className="text-sm font-medium text-primary-950 leading-normal">{skill.name}</span>
                      </div>
                      <span className="text-xs text-primary-950/70 leading-normal tracking-wide">{skill.level}</span>
                    </div>
                    <div className="w-full bg-primary-50 rounded-full h-2">
                      <m.div
                        className="bg-accent h-2 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${skill.progress}%` }}
                        transition={{ duration: 0.6, delay: 1.6 + index * 0.05, ease: [0.16, 1, 0.3, 1] }}
                      />
                    </div>
                  </m.div>
                ))}
              </div>
            </m.div>

            {/* 资格证书 */}
            <m.div
              className="bg-primary-100 rounded-lg shadow-lg p-6"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 1.4, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                  <TrophyIcon className="text-xl text-accent" />
                </div>
                <h2 className="text-2xl font-semibold leading-tight tracking-tight text-primary-950">{content.certificates.title}</h2>
              </div>
              
              <div className="flex items-center gap-2">
                <CheckCircleIcon className="w-5 h-5 text-accent" />
                <span className="text-base text-primary-950 leading-normal">{content.certificates.cet6}</span>
              </div>
            </m.div>

            {/* 兴趣爱好 */}
            <m.div
              className="bg-primary-100 rounded-lg shadow-lg p-6"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 1.45, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                  <HeartIcon className="text-xl text-accent" />
                </div>
                <h2 className="text-2xl font-semibold leading-tight tracking-tight text-primary-950">{content.hobbies.title}</h2>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🎮</span>
                  <span className="text-base text-primary-950 leading-normal">{content.hobbies.gaming}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🚴</span>
                  <span className="text-base text-primary-950 leading-normal">{content.hobbies.cycling}</span>
                </div>
              </div>
            </m.div>
          </div>
        </div>

        {/* 自我评价 */}
        <m.div
          className="bg-primary-100 rounded-lg shadow-lg p-6 mt-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
              <UserIcon className="text-xl text-accent" />
            </div>
            <h2 className="text-2xl font-semibold leading-tight tracking-tight text-primary-950">{content.self_evaluation.title}</h2>
          </div>
          
          <p className="text-base leading-relaxed text-primary-950 max-w-4xl">{content.self_evaluation.content}</p>
        </m.div>

        {/* 返回首页链接 */}
        <div className="mt-6 text-center">
          <Link
            to="/"
            prefetch="intent"
            className="inline-flex items-center gap-2 bg-accent text-white px-6 py-3 rounded text-sm font-medium transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 active:shadow-md"
            style={{ transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)' }}
          >
            ← 返回首页
          </Link>
        </div>
      </div>
    </div>
    </LazyMotion>
  );
}

export function ErrorBoundary() {
  return (
    <div className="min-h-screen bg-primary-50 flex items-center justify-center p-4">
      <div className="bg-primary-100 p-6 md:p-8 rounded-lg shadow-lg max-w-md w-full">
        <div className="text-center">
          <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-8 h-8 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold leading-tight tracking-tight text-primary-950 mb-2">简历页面错误</h1>
          <p className="text-base leading-relaxed text-primary-950/70 mb-4">抱歉，个人简历页面暂时无法显示。</p>
          <Link
            to="/"
            className="bg-accent text-white px-6 py-3 rounded text-sm font-medium transition-all duration-300 inline-block shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 active:shadow-md"
            style={{ transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)' }}
          >
            返回首页
          </Link>
        </div>
      </div>
    </div>
  );
}

