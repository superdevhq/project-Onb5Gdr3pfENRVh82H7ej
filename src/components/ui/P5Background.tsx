
import { useEffect, useRef } from 'react';
import p5 from 'p5';

interface P5BackgroundProps {
  className?: string;
}

const P5Background = ({ className = '' }: P5BackgroundProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sketchInstance = useRef<p5 | null>(null);

  useEffect(() => {
    // Only create a new p5 instance if one doesn't already exist
    if (!sketchInstance.current && containerRef.current) {
      const sketch = (p: p5) => {
        // Particle system
        class Particle {
          pos: p5.Vector;
          vel: p5.Vector;
          acc: p5.Vector;
          color: p5.Color;
          size: number;
          maxSpeed: number;
          
          constructor() {
            this.pos = p.createVector(p.random(p.width), p.random(p.height));
            this.vel = p5.Vector.random2D().mult(p.random(0.2, 0.5));
            this.acc = p.createVector(0, 0);
            this.color = p.color(
              p.random(100, 200), 
              p.random(50, 100), 
              p.random(200, 255), 
              p.random(20, 60)
            );
            this.size = p.random(2, 6);
            this.maxSpeed = p.random(0.5, 1.5);
          }
          
          update() {
            // Add slight mouse attraction
            if (p.mouseX !== 0 && p.mouseY !== 0) {
              const mouse = p.createVector(p.mouseX, p.mouseY);
              const dir = p5.Vector.sub(mouse, this.pos);
              const distance = dir.mag();
              
              if (distance < 200) {
                dir.normalize();
                dir.mult(0.1);
                this.acc.add(dir);
              }
            }
            
            // Update velocity and position
            this.vel.add(this.acc);
            this.vel.limit(this.maxSpeed);
            this.pos.add(this.vel);
            this.acc.mult(0);
            
            // Wrap around edges
            if (this.pos.x > p.width) this.pos.x = 0;
            if (this.pos.x < 0) this.pos.x = p.width;
            if (this.pos.y > p.height) this.pos.y = 0;
            if (this.pos.y < 0) this.pos.y = p.height;
          }
          
          display() {
            p.noStroke();
            p.fill(this.color);
            p.ellipse(this.pos.x, this.pos.y, this.size);
          }
          
          connect(particles: Particle[]) {
            particles.forEach(other => {
              const d = p5.Vector.dist(this.pos, other.pos);
              if (d < 100) {
                const alpha = p.map(d, 0, 100, 50, 0);
                p.stroke(255, 255, 255, alpha);
                p.line(this.pos.x, this.pos.y, other.pos.x, other.pos.y);
              }
            });
          }
        }
        
        // Array to hold particles
        let particles: Particle[] = [];
        const numParticles = 50;
        
        p.setup = () => {
          const canvas = p.createCanvas(p.windowWidth, p.windowHeight);
          canvas.position(0, 0);
          canvas.style('z-index', '-1');
          
          // Create particles
          for (let i = 0; i < numParticles; i++) {
            particles.push(new Particle());
          }
        };
        
        p.draw = () => {
          p.clear();
          
          // Update and display particles
          particles.forEach(particle => {
            particle.update();
            particle.display();
          });
          
          // Connect particles with lines
          particles.forEach(particle => {
            particle.connect(particles);
          });
        };
        
        p.windowResized = () => {
          p.resizeCanvas(p.windowWidth, p.windowHeight);
        };
      };
      
      // Create new p5 instance
      sketchInstance.current = new p5(sketch, containerRef.current);
    }
    
    // Cleanup function
    return () => {
      if (sketchInstance.current) {
        sketchInstance.current.remove();
        sketchInstance.current = null;
      }
    };
  }, []);
  
  return <div ref={containerRef} className={`fixed top-0 left-0 w-full h-full ${className}`} />;
};

export default P5Background;
