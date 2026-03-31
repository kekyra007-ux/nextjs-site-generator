const fs = require('fs');
const path = require('path');

class PlaceholderGenerator {
  constructor(config, projectPath) {
    this.config = config;
    this.projectPath = projectPath;
  }

  generateAll() {
    const { locales } = this.config.geo;
    
    locales.forEach(locale => {
      const structure = this.getLocaleStructure(locale);
      const localeDir = path.join(this.projectPath, 'public', 'locales', locale);
      
      if (!fs.existsSync(localeDir)) {
        fs.mkdirSync(localeDir, { recursive: true });
      }
      
      fs.writeFileSync(
        path.join(localeDir, 'common.json'),
        JSON.stringify(structure, null, 2)
      );
    });
    
    console.log('✅ Placeholder common.json files generated successfully');
  }

  getLocaleStructure(locale) {
    const { pages, pageSections, pageKeywords } = this.config;
    
    const structure = {
      common: {
        brand: this.config.project.brandName,
        allRightsReserved: "All rights reserved",
        loading: "Loading..."
      },
      nav: {
        home: "Home",
        products: "Products",
        services: "Services",
        events: "Events",
        offers: "Offers"
      },
      seo: {},
      hero: {},
      sections: {}
    };

    pages.forEach(page => {
      // Handle both string and object formats
      const pageKey = typeof page === 'string' ? page : page.key;
      // SEO
      structure.seo[pageKey] = {
        title: `[PLACEHOLDER] ${this.config.project.brandName} - ${pageKey}`,
        description: `[PLACEHOLDER] Description for ${pageKey} page`,
        keywords: pageKeywords[pageKey]?.[locale] || []
      };

      // Hero
      structure.hero[pageKey] = this.getHeroPlaceholder(pageKey);

      // Sections
      const sections = pageSections[pageKey] || [];
      sections.forEach(sectionKey => {
        if (!structure.sections[sectionKey]) {
          structure.sections[sectionKey] = {};
        }
        structure.sections[sectionKey][pageKey] = this.getSectionPlaceholder(sectionKey, pageKey);
      });
    });

    return structure;
  }

  getHeroPlaceholder(pageKey) {
    return {
      badge: `[PLACEHOLDER] Hot Offer`,
      title: `[PLACEHOLDER] Hero Title for ${pageKey}`,
      subtitle: `[PLACEHOLDER] Hero Subtitle for ${pageKey}`,
      primaryCta: `[PLACEHOLDER] Get Started`,
      secondaryCta: `[PLACEHOLDER] Learn More`
    };
  }

  getSectionPlaceholder(sectionKey, pageKey) {
    const placeholders = {
      homeArticle: {
        title: `[PLACEHOLDER] Article Title`,
        subtitle: `[PLACEHOLDER] Article subtitle for ${pageKey}`,
        p1: `[PLACEHOLDER] First paragraph content for ${pageKey}`,
        p2: `[PLACEHOLDER] Second paragraph content`,
        list: [
          '[PLACEHOLDER] List item 1',
          '[PLACEHOLDER] List item 2',
          '[PLACEHOLDER] List item 3'
        ],
        p3: `[PLACEHOLDER] Third paragraph content`
      },
      
      featureGrid: {
        title: `[PLACEHOLDER] Features`,
        items: [
          {
            title: '[PLACEHOLDER] Feature 1',
            text: '[PLACEHOLDER] Feature 1 description'
          },
          {
            title: '[PLACEHOLDER] Feature 2',
            text: '[PLACEHOLDER] Feature 2 description'
          },
          {
            title: '[PLACEHOLDER] Feature 3',
            text: '[PLACEHOLDER] Feature 3 description'
          }
        ]
      },

      faqBlock: {
        title: `[PLACEHOLDER] FAQ`,
        items: [
          {
            q: '[PLACEHOLDER] Question 1?',
            a: '[PLACEHOLDER] Answer 1'
          },
          {
            q: '[PLACEHOLDER] Question 2?',
            a: '[PLACEHOLDER] Answer 2'
          },
          {
            q: '[PLACEHOLDER] Question 3?',
            a: '[PLACEHOLDER] Answer 3'
          }
        ]
      },

      ctaBlock: {
        title: `[PLACEHOLDER] Ready to start?`,
        text: `[PLACEHOLDER] Join us today and get the best experience.`,
        buttonText: `[PLACEHOLDER] Register Now`
      },

      offerSection: {
        title: `[PLACEHOLDER] Exclusive Offers`,
        subtitle: `[PLACEHOLDER] Boost your experience with our special promotions`,
        items: [
          {
            badge: `[PLACEHOLDER] New`,
            title: `[PLACEHOLDER] Premium Welcome Package`,
            description: `[PLACEHOLDER] Get started with our premium service package and experience the best we have to offer!`,
            buttonText: `[PLACEHOLDER] Claim Offer`,
            termsText: `[PLACEHOLDER] *T&C Apply. New users only.`
          },
          {
            badge: `[PLACEHOLDER] Featured`,
            title: `[PLACEHOLDER] Loyalty Rewards Program`,
            description: `[PLACEHOLDER] Earn exclusive rewards and benefits every time you use our platform.`,
            buttonText: `[PLACEHOLDER] Learn More`,
            termsText: `[PLACEHOLDER] *Available to registered users.`
          }
        ]
      },

      paymentMethods: {
        title: `[PLACEHOLDER] Secure Payments`,
        subtitle: `[PLACEHOLDER] We support the most popular and secure payment methods`,
        items: [
          { name: `[PLACEHOLDER] Visa`, icon: `💳`, type: `[PLACEHOLDER] Card` },
          { name: `[PLACEHOLDER] MasterCard`, icon: `💳`, type: `[PLACEHOLDER] Card` },
          { name: `[PLACEHOLDER] Bitcoin`, icon: `₿`, type: `[PLACEHOLDER] Crypto` },
          { name: `[PLACEHOLDER] Ethereum`, icon: `Ξ`, type: `[PLACEHOLDER] Crypto` },
          { name: `[PLACEHOLDER] Skrill`, icon: `💰`, type: `[PLACEHOLDER] E-Wallet` }
        ]
      },

      howToPlay: {
        title: `[PLACEHOLDER] How To Get Started`,
        subtitle: `[PLACEHOLDER] Follow these simple steps to begin your journey`,
        steps: [
          {
            step: "1",
            title: `[PLACEHOLDER] Create Account`,
            description: `[PLACEHOLDER] Sign up in just a few seconds with your email or phone number.`
          },
          {
            step: "2",
            title: `[PLACEHOLDER] Choose a Plan`,
            description: `[PLACEHOLDER] Select the service or product that best fits your needs.`
          },
          {
            step: "3",
            title: `[PLACEHOLDER] Explore Features`,
            description: `[PLACEHOLDER] Browse our wide selection of features and discover what we offer.`
          },
          {
            step: "4",
            title: `[PLACEHOLDER] Achieve Your Goals`,
            description: `[PLACEHOLDER] Use our platform to reach your objectives and enjoy the results!`
          }
        ],
        buttonText: `[PLACEHOLDER] Get Started Now`
      },

      itemsList: {
        title: `[PLACEHOLDER] Featured Products`,
        subtitle: `[PLACEHOLDER] Explore our top-rated products and find your perfect match`,
        items: [
          {
            icon: `⭐`,
            title: `[PLACEHOLDER] Premium Service`,
            category: `[PLACEHOLDER] Featured`,
            description: `[PLACEHOLDER] Our flagship service offering exceptional quality and outstanding results.`,
            badge: `[PLACEHOLDER] Popular`
          },
          {
            icon: `🚀`,
            title: `[PLACEHOLDER] Advanced Solution`,
            category: `[PLACEHOLDER] Products`,
            description: `[PLACEHOLDER] A powerful solution designed to help you achieve more in less time.`
          },
          {
            icon: `💡`,
            title: `[PLACEHOLDER] Smart Tools`,
            category: `[PLACEHOLDER] Tools`,
            description: `[PLACEHOLDER] Intelligent tools that streamline your workflow and boost productivity.`
          },
          {
            icon: `🎯`,
            title: `[PLACEHOLDER] Targeted Plans`,
            category: `[PLACEHOLDER] Plans`,
            description: `[PLACEHOLDER] Flexible plans tailored to your specific requirements and budget.`,
            badge: `[PLACEHOLDER] New`
          },
          {
            icon: `🏆`,
            title: `[PLACEHOLDER] Expert Support`,
            category: `[PLACEHOLDER] Support`,
            description: `[PLACEHOLDER] World-class support team available to help you succeed.`,
            badge: `[PLACEHOLDER] Hot`
          },
          {
            icon: `🔧`,
            title: `[PLACEHOLDER] Custom Solutions`,
            category: `[PLACEHOLDER] Custom`,
            description: `[PLACEHOLDER] Bespoke solutions crafted to meet your unique business needs.`
          }
        ],
        buttonText: `[PLACEHOLDER] View All Products`
      },

      contentShowcase: {
        title: `[PLACEHOLDER] Why Choose Us`,
        lead: `[PLACEHOLDER] Discover what makes our platform the preferred choice for thousands of customers worldwide. We combine cutting-edge technology with unmatched quality.`,
        highlights: [
          {
            label: `[PLACEHOLDER] Products`,
            value: `[PLACEHOLDER] 2,000+ Premium Options`
          },
          {
            label: `[PLACEHOLDER] Payout Speed`,
            value: `[PLACEHOLDER] Under 24 Hours`
          },
          {
            label: `[PLACEHOLDER] Support`,
            value: `[PLACEHOLDER] 24/7 Live Chat`
          },
          {
            label: `[PLACEHOLDER] Security`,
            value: `[PLACEHOLDER] SSL Encrypted`
          }
        ],
        blocks: [
          {
            title: `[PLACEHOLDER] Unrivaled Product Selection`,
            text: `[PLACEHOLDER] Our platform features an extensive catalog of products and services from leading providers. From essential solutions to premium offerings, every customer finds their perfect match.`,
            highlight: `[PLACEHOLDER] We partner with over 50 top-tier providers to bring you the best experience.`
          },
          {
            title: `[PLACEHOLDER] Safe and Secure Platform`,
            text: `[PLACEHOLDER] Your security is our top priority. We use industry-standard encryption and are fully compliant to ensure safe transactions and protect your personal data.`,
            highlight: `[PLACEHOLDER] Fully compliant with 256-bit SSL encryption for all transactions.`
          },
          {
            title: `[PLACEHOLDER] Rewarding Loyalty Program`,
            text: `[PLACEHOLDER] The more you engage, the more you earn. Our multi-tier loyalty program offers exclusive offers, cashback rewards, and VIP perks that grow with your journey.`
          }
        ],
        closingTitle: `[PLACEHOLDER] Ready to Experience the Difference?`,
        closingText: `[PLACEHOLDER] Join thousands of satisfied customers and start your journey today with our exclusive welcome offer.`,
        buttonText: `[PLACEHOLDER] Join Now`
      }
    };

    return placeholders[sectionKey] || { title: `[PLACEHOLDER] ${sectionKey}` };
  }
}

module.exports = PlaceholderGenerator;
