---
id: 2
seq: 1
title: "Object Orientation & Domain Modeling: A Historical Throughline"
date: "2024-12-12"
updatedAt: "2024-12-12T15:34:19.212Z"
slug: "객체지향과-도메인-모델링-소프트웨어-설계-사상의-역사적-흐름-1"
category: "tech"
---

# Chapter 1. Birth of Object Orientation and Its Early Ideas

## 1.1 Rising Complexity and the Need for a New Paradigm

By the 1950s and 1960s software was spreading into every scientific and industrial domain and rapidly growing in scale. As programs expanded to support scientific computing, enterprise information processing, and simulations, the procedural paradigm hit its limits: listing instructions in order was no longer enough to cope with the complexity.

Researchers therefore tried to **abstract programs into units that resemble real-world concepts** so they could control that complexity. They wanted to map domain entities directly into code structures and couple data with the logic that acts on it. The idea that emerged from this exploration was the **object**.

## 1.2 Simula: The Origin of the Object Concept

When we talk about the roots of object orientation, we cannot skip the **Simula** language created in the mid-1960s by Ole-Johan Dahl and Kristen Nygaard at the Norwegian Computing Center. **Simula 67** introduced the notion of classes so that programs could define abstractions of real-world concepts and instantiate them as objects for simulation.

This gave birth to the idea of **abstraction and encapsulation**—bundling data and behavior together. Simula did not grab huge commercial attention at the time, but it prepared the ground on which later OO languages and domain-centric thinking could flourish.

> References
> - Dahl, O.-J., & Nygaard, K. (1966). *SIMULA—an ALGOL-based simulation language.* Communications of the ACM.
> - Nygaard, K., & Dahl, O.-J. (1978). *The development of the SIMULA languages.* History of Programming Languages, ACM.

## 1.3 Alan Kay and Smalltalk: Solidifying the Philosophy

The object concept that began with Simula gained philosophical depth through **Smalltalk**, developed in the 1970s at Xerox PARC by Alan Kay and his colleagues. Kay defined object orientation as **a way of thinking rather than merely a language technique**. He imagined a system as **an organism of autonomous objects that cooperate through message passing**. In his view, each object hides its implementation details and communicates purely through messages—**a unit of distributed intelligence and interaction**.

### Kay’s Vision and Historical Context

Kay’s grand vision revolved around **personal computing, education, and intuitive interaction**. Through the concept of the “Dynabook,” he imagined a future where anyone—child or adult—could interact with computers intuitively, learn, and create. Object orientation was not just about structuring code; it was the key abstraction principle for enabling that human-friendly, learning-friendly computing environment.

At Xerox PARC, engineers were experimenting with the mouse, high-resolution displays, GUIs, and WYSIWYG editors under the assumption that **everyone would eventually use a graphical monitor and mouse**. In a world where “everything is an object,” Smalltalk was the ideal medium to realize that style of interaction. The GUI was important in turning that philosophy into a visual interface, but it was not the goal itself; it emerged naturally from the pursuit of an interactive, educational, personalized computing vision.

> - Steve Jobs, fascinated by the work at Xerox PARC, once [explained object orientation himself](https://medium.com/curious-burrows/steve-jobs-explains-object-oriented-programming-d29451775afd).
> - After leaving Apple, Jobs founded NeXT and built “NeXTSTEP,” the world’s first commercial object-oriented operating system.
> - NeXTSTEP was written in Objective-C and eventually evolved through Rhapsody into what powers today’s macOS/iOS ecosystem.

## 1.4 Essence of the Early OO Mindset

The pioneers were hinting at more than a new language feature set:

- **Abstraction and encapsulation** made it possible to hide internal details and keep reusable components manageable.
- **Message-driven collaboration** meant systems were modeled as flexible networks of cooperating agents.
- **Human-friendly modeling** projected real-world concepts directly into code so people could reason about systems more naturally.

Software creation was starting to look like **managing complexity through domain understanding**, not just composing instructions.

## 1.5 From OO to Domain Modeling and Eventually DDD

OO ideas alone could not conquer every enterprise-scale challenge. Throughout the 1980s–1990s, Grady Booch, James Rumbaugh, Ivar Jacobson, and others evolved OO analysis/design (OOAD) and UML so teams could model huge domains structurally. That work mainstreamed **domain modeling** and ultimately set the stage for Eric Evans’s 2003 book on Domain-Driven Design (DDD), which elevated domain knowledge to the center of strategic design.

# Chapter 2. From Language Features to Analysis/Design Methodologies

## 2.1 From Language to Methodology

As OO languages matured, industry needed answers to higher-level questions: how do we identify objects, organize their collaboration, and turn requirements into object models? The late 1980s and early 1990s therefore became a whirlwind of OOAD methods.

## 2.2 Rise of OOAD Methods

### 2.2.1 Booch Method

Grady Booch’s *Object-Oriented Design with Applications* (1991) detailed how to discover classes and structure systems. His rich notation and emphasis on iterative, incremental development later inspired UML.

> Reference: Booch, G. (1991). *Object-Oriented Design with Applications.*

### 2.2.2 OMT (Object Modeling Technique)

James Rumbaugh’s OMT (1991) introduced the object/dynamic/functional model trio so teams could express both structure and behavior. The object model in particular helped engineers present the domain’s static aspects clearly.

> Reference: Rumbaugh, J. et al. (1991). *Object-Oriented Modeling and Design.*

### 2.2.3 OOSE (Object-Oriented Software Engineering)

Ivar Jacobson’s OOSE (1992) made **use cases** a first-class analysis tool. Capturing user goals and system responses before design provided a practical bridge from requirements to object models.

> Reference: Jacobson, I. et al. (1992). *Object-Oriented Software Engineering.*

## 2.3 Integrating the Methods

By the mid‑1990s there were too many competing notations. Booch, Rumbaugh, and Jacobson—dubbed the “Three Amigos”—joined forces at Rational Software to unify their ideas. The result was the early versions of the Unified Modeling Language.

## 2.4 UML and Its Standardization

### 2.4.1 Goals and Features

When the OMG adopted UML in 1997 it set out to:

1. Provide a **shared visualization language** for models, designs, and architectures.
2. Stay **methodology-neutral** so it could coexist with various processes.
3. Offer **standardized semantics** for diagrams such as class, sequence, and use-case diagrams.

### 2.4.2 Key Diagrams for Domain Modeling

Class diagrams gave teams a formal way to express classes, attributes, generalization, composition, and associations. Use-case diagrams institutionalized Jacobson’s technique. Sequence, communication, state-machine, and activity diagrams captured dynamic aspects.

> References
> - Booch, G., Rumbaugh, J., & Jacobson, I. (1999). *The Unified Modeling Language User Guide.*
> - OMG. *UML Specification.*

### 2.4.3 Tool Support and Adoption

Once UML became an OMG standard, CASE vendors such as Rational Rose, TogetherJ, and Enterprise Architect shipped tooling that made it easier to maintain domain models consistently across large teams.

## 2.5 After UML: OO Meets Domain Modeling

UML established OO as a full-lifecycle concern, but diagrams alone could not keep pace with volatile business knowledge. Teams needed a way to keep the model itself alive throughout development—an idea that paved the way for Domain-Driven Design.

---

# Chapter 3. Rediscovering Domain Modeling and the Rise of DDD

## 3.1 Seeing Domain Modeling Anew

As discussed in chapter 2, by the late 1990s developers could model domains visually and architecturally. But enterprise systems were exploding in complexity—e-commerce, online banking, global supply chains, ERP, CRM. These systems encoded countless business rules and exceptions, and requirements changed constantly. The infrastructure stack was getting diverse as well: databases, mainframes, distributed objects, web frameworks, message queues.

In that environment the domain model could no longer be a deliverable that stops at design time. It had to become **a body of knowledge maintained throughout the entire lifecycle**. If the model failed to capture business logic accurately, the system became brittle and expensive to maintain, and communication between stakeholders broke down.

## 3.2 Enterprise Architecture Thinkers

To address this, thought leaders such as **Martin Fowler** began cataloging enterprise patterns. His 2002 book *Patterns of Enterprise Application Architecture* explained layered architecture, domain model, data mapper, transaction script, service layer, and more. These patterns were invaluable for infrastructure problems, but they left room for a deeper approach to the domain itself.

> Reference: Fowler, M. (2002). *Patterns of Enterprise Application Architecture.* Addison-Wesley.

## 3.3 Eric Evans and the Arrival of DDD (2003)

In 2003, **Eric Evans** published *Domain-Driven Design: Tackling Complexity in the Heart of Software*, reframing software’s core challenge as “domain complexity.” He proposed both strategic and tactical patterns to tackle it.

DDD is not just another method; it is a philosophy covering the entire journey of exploring domain knowledge, expressing it as models, and keeping developers and domain experts in tight collaboration. Evans emphasized the tight coupling of model, implementation, and language through ideas such as:

- **Ubiquitous Language**: a shared vocabulary embedded in code and conversations.
- **Bounded Context**: dividing a large system into coherent subdomains, each with its own consistent model.
- Tactical patterns like **Aggregates, Entities, Value Objects, Domain Services, Domain Events**.
- **Strategic Design**: deciding where to go deep, how to set boundaries, and how teams collaborate.

> Reference: Evans, E. (2003). *Domain-Driven Design.* Addison-Wesley.

## 3.4 DDD’s Impact on Collaboration

DDD fundamentally reframed development as **knowledge crunching**. Instead of treating analysis, design, and coding as separate silos, it encouraged ongoing conversations, collaborative modeling sessions, and constant refinement of language. The philosophy also introduced strategies such as focusing on core domains, aligning language with code, and using bounded contexts to keep complexity manageable.

## 3.5 Community Growth and Practice

After 2003 the ideas spread through conferences (OOPSLA, QCon, DDD Europe, etc.), online forums, and workshops hosted by Eric Evans and other pioneers. Vaughn Vernon’s 2013 book *Implementing Domain-Driven Design* provided hands-on guidance, and Alberto Brandolini’s **Event Storming** workshops gave teams a fast, visual way to explore domain events together.

## 3.6 Microservices and DDD

By the mid‑2010s, cloud and DevOps culture pushed organizations toward **microservices**. Bounded contexts became a natural way to define service boundaries, and patterns such as Event Sourcing and CQRS blended DDD values with distributed architectures. DDD proved it could adapt to new infrastructure trends rather than remaining a 2000s artifact.

---

# Chapter 4. Modern Domain Modeling: Beyond DDD

## 4.1 Introduction: A New Era

From the mid‑2000s onward, DDD steadily seeped into industry practice. As cloud computing, containers, and DevOps accelerated in the 2010s, domain modeling merged with new architectural styles, tools, and collaboration techniques. Microservices, event-driven architecture, Event Storming, BDD, and DSLs all reinforced domain-centric thinking.

## 4.2 Microservices & Strategic Design

Microservices became popular because they promised organizational and architectural scalability. **Bounded contexts** aligned perfectly with service boundaries, while strategic design tools (Context Mapping, Core/Supporting/Generic domains) guided how teams and services should be sliced.

### 4.2.1 Event-Driven Architecture (EDA)

Event-driven approaches, popularized by Gregor Hohpe, Bobby Woolf, and others, mesh well with DDD. Aggregates publish domain events; other contexts react asynchronously. That loose coupling lets each bounded context evolve independently while still sharing meaningful information.

## 4.3 Event Storming (2012~)

Alberto Brandolini introduced **Event Storming** as a fast, collaborative workshop for exploring domains. Participants map domain events on a wall, discover commands, policies, external systems, and read models. Because domain experts and developers build the picture together, the ubiquitous language stays honest. Event Storming also makes it easier to identify bounded contexts and design aggregates.

> Reference: Brandolini, A. (2014). “Introducing EventStorming.”

## 4.4 Behaviour-Driven Development (BDD)

Dan North proposed BDD in 2006, and Matt Wynne/Aslak Hellesøy extended it through Cucumber. BDD connects domain modeling with automated tests and clear requirement descriptions. Scenarios written in a ubiquitous language can be executed, keeping the model, tests, and behavior in sync.

> References
> - North, D. (2006). “Introducing BDD.”
> - Wynne, M., & Hellesoy, A. (2012). *The Cucumber Book.* Pragmatic Bookshelf.

## 4.5 Domain-Specific Languages (DSLs)

As domains get richer, the ability to express them clearly becomes critical. Martin Fowler’s *Domain-Specific Languages* (2010) categorized internal/external DSL patterns, showing how we can capture domain logic in a language domain experts recognize. DSLs amplify ubiquitous language directly in code.

> References
> - Fowler, M. (2010). *Domain-Specific Languages.* Addison-Wesley.
> - Mernik, M., Heering, J., & Sloane, A. (2005). “When and how to develop domain-specific languages.” *ACM Computing Surveys*, 37(4).

## 4.6 Knowledge Sharing and Community Growth

DDD and contemporary domain-modeling practices spread quickly through meetups and conferences such as DDD Europe, Explore DDD, QCon, O’Reilly Software Architecture, MicroXchg, and numerous Slack/Discord communities. Case studies from finance, manufacturing, healthcare, commerce, logistics, and more helped the techniques mature.

## 4.7 Implications for the Future

Modern domain modeling sits at the intersection of DDD, microservices, events, BDD, DSLs, and more. The key takeaways:

1. **Continual domain understanding matters.** Tech stacks change, but the effort to refine domain knowledge is an enduring asset.
2. **Scalable collaboration models are crucial.** Practices like Event Storming and BDD bring product, design, development, and operations together.
3. **Future tech still needs domain thinking.** AI, ML, blockchain, IoT—all require domain principles to integrate into real-world processes.

---

# Chapter 5. What These Shifts Mean for Software

## 5.1 Re-reading the Historical Flow

Chapter 1 traced object orientation back to Simula and Smalltalk, where OO started as a way to view the world through interacting objects. Chapter 2 showed how OO matured into analysis and design methodologies, culminating in UML as a shared language. Chapter 3 described how DDD re-centered the conversation around domain complexity and framed software development as **knowledge formation**. Chapter 4 highlighted how DDD’s philosophy now powers microservices, EDA, Event Storming, BDD, DSLs, and other modern practices.

## 5.2 Cultural Changes in Software Development

1. **From developer-centric to domain-centric.** Early development focused on languages and algorithms. Today the emphasis is on business problems, domain knowledge, and modeling activities.
2. **From top-down handoffs to collaborative knowledge sharing.** Instead of requirements handing off to design and then to dev, practices like DDD and Event Storming bring everyone together to explore the domain collectively.
3. **From static documents to executable models.** Analysis documents used to rot on shelves. Now BDD scenarios, DSLs, Event Storming artifacts, and DDD codebases act as living models that evolve with the system.

## 5.3 Maximizing Business Value

- **Responding to change.** Business rules shift due to regulations and market moves. Organizations with strong domain models can adapt quickly without destabilizing the whole system.
- **Accumulating knowledge for long-term advantage.** Teams that adopt DDD refine models release by release, gaining new insights through Event Storming and codifying requirements via BDD. This accumulated knowledge becomes a strategic asset.

## 5.4 Domain Modeling in New Tech Eras

Will domain-modeling philosophy remain relevant in an age of AI, ML, cloud-native, IoT, blockchain? Absolutely. Even as technologies evolve, the principle of **applying tech within the right domain context** stays constant. For example, integrating ML outputs into domain logic or retraining models to follow new business rules still requires domain thinking.

## 5.5 Conclusion: The Staying Power of Domain-Centric Thinking

The journey from object orientation to domain modeling to DDD and modern practices is more than a technical evolution; it is a **philosophical shift** that puts people and business value at the center. This history is an ongoing search for how software can better represent reality, adapt to change, and amplify the flow of knowledge.

To summarize:

- Object orientation started as a way to see the world through interacting objects.
- OOAD and UML standardized how we structure and share domain models.
- DDD unified model, language, and code, redefining development as a knowledge-building process.
- Modern techniques extend DDD into microservices, EDA, Event Storming, BDD, DSLs, and collaborative ecosystems.

Ultimately, domain-centric approaches keep pushing the software industry forward by focusing on the real problems we solve rather than the tools we use. I hope this narrative helps you grasp that flow and think about where domain modeling should head next.

> This article was written together with AI.
