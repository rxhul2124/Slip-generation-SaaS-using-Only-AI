import type { ReactNode } from "react";
import { motion } from "framer-motion";

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  center
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  center?: ReactNode;
}) {
  return (
    <div className="mb-6 md:mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <motion.div
        className="flex-1 md:flex-initial min-w-0"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
        }}
      >
        {eyebrow ? (
          <motion.div variants={{ hidden: { opacity: 0, x: -10 }, visible: { opacity: 1, x: 0 } }} className="mb-1 text-xs font-bold uppercase tracking-[0.18em] text-primary">
            {eyebrow}
          </motion.div>
        ) : null}
        <motion.h1 variants={{ hidden: { opacity: 0, x: -10 }, visible: { opacity: 1, x: 0 } }} className="text-2xl font-black tracking-normal md:text-3xl">
          {title}
        </motion.h1>
        {description ? (
          <motion.p variants={{ hidden: { opacity: 0, x: -10 }, visible: { opacity: 1, x: 0 } }} className="mt-2 max-w-3xl text-sm text-muted-foreground">
            {description}
          </motion.p>
        ) : null}
      </motion.div>
      {center ? (
        <div className="flex flex-1 justify-center py-2 md:py-0">
          {center}
        </div>
      ) : null}
      {actions ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="flex flex-1 md:flex-initial flex-wrap items-center justify-end gap-2"
        >
          {actions}
        </motion.div>
      ) : null}
    </div>
  );
}

