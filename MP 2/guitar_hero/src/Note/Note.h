#ifndef NOTE_H
#define NOTE_H

class Note
{
	public:
		Note(short lane, short startTime, short pitch);
		void update();
		void click();
		bool valid();
		void reset();
		short currX_;
        short currY_;
        short currW_;
        short currH_;
		short startTime_;
		short lane_;
		short pitch_;
	private:
		bool clicked_;
};

#endif